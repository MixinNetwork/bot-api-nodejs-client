import forge from 'node-forge';
import { parse as UUIDParse, stringify } from 'uuid';
import type { CollectibleOutputsResponse, NFOMemo } from '../types';
import type { KeystoreClientReturnType } from '../mixin-client';
import { buildMultiSigsTransaction, encodeScript } from './multisigs';
import { Encoder, integerToBytes } from './encoder';
import { Decoder } from './decoder';

const Prefix = 'NFO';
const Version = 0x00;

export const DefaultChain = '43d61dcd-e413-450d-80b8-101d5e903357';
export const DefaultClass = '3c8c161a18ae2c8b14fda1216fff7da88c419b5d';
export const DefaultNftAssetId = '1700941284a95f31b25ec8c546008f208f88eee4419ccdcdbe6e3195e60128ca';

export function buildTokenId(collection_id: string, token: number): string {
  const tokenStr = Buffer.from(integerToBytes(token)).toString('hex');
  const msg = DefaultChain.replaceAll('-', '') + DefaultClass + collection_id.replaceAll('-', '') + tokenStr;
  const md5 = forge.md.md5.create();
  md5.update(Buffer.from(msg, 'hex').toString('binary'));
  const bytes = Buffer.from(md5.digest().bytes(), 'binary');
  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return stringify(bytes);
}

/**
 * Content must be hex string without '0x'
 * */
export function buildCollectibleMemo(content: string, collection_id?: string, token_id?: number): string {
  const encoder = new Encoder(Buffer.from(Prefix, 'utf8'));
  encoder.write(Buffer.from([Version]));

  if (collection_id && token_id) {
    encoder.write(Buffer.from([1]));
    encoder.writeUint64(BigInt(1));
    encoder.writeUUID(DefaultChain);

    encoder.writeSlice(Buffer.from(DefaultClass, 'hex'));
    encoder.writeSlice(Buffer.from(UUIDParse(collection_id) as Buffer));
    encoder.writeSlice(Buffer.from(integerToBytes(token_id)));
  } else {
    encoder.write(Buffer.from([0]));
  }

  encoder.writeSlice(Buffer.from(content, 'hex'));
  return encoder.buf.toString('hex');
}

export const decodeNfoMemo = (hexMemo: string) => {
  const memo = Buffer.from(hexMemo, 'hex');
  if (memo.byteLength < 4) throw Error(`Invalid NFO memo length: ${memo.byteLength}`);
  const prefix = memo.subarray(0, 3).toString();
  if (prefix !== Prefix) throw Error(`Invalid NFO memo prefix: ${prefix}`);
  const version = memo.readUint8(3);
  if (version !== Version) throw Error(`Invalid NFO memo version: ${version}`);

  const nm: NFOMemo = {
    prefix: Prefix,
    version: Version,
    extra: '',
  };
  const decoder = new Decoder(memo.subarray(4));
  const hint = decoder.readByte();

  if (hint === 1) {
    nm.mask = Number(decoder.readUInt64());
    if (nm.mask !== 1) throw Error(`Invalid NFO memo mask: ${nm.mask}`);

    nm.chain = stringify(decoder.readUUID());
    if (nm.chain !== DefaultChain) throw Error(`Invalid NFO memo chain: ${nm.chain}`);

    nm.class = decoder.readBytes();
    if (nm.class !== DefaultClass) throw Error(`Invalid NFO memo chain: ${nm.class}`);

    const collection = Buffer.from(decoder.readBytes(), 'hex');
    nm.collection = stringify(collection);

    nm.token = parseInt(decoder.readBytes(), 16);
  }

  nm.extra = Buffer.from(decoder.readBytes(), 'hex').toString();
  return nm;
};

export const buildNfoTransferRequest = async (client: KeystoreClientReturnType, utxo: CollectibleOutputsResponse, receivers: string[], threshold: number, content = '') => {
  const keys = await client.transfer.outputs([
    {
      receivers,
      index: 0,
    },
  ]);

  const raw = buildMultiSigsTransaction({
    version: 2,
    asset: DefaultNftAssetId,
    inputs: [
      {
        hash: utxo.transaction_hash,
        index: utxo.output_index,
      },
    ],
    outputs: [
      {
        amount: '1',
        mask: keys[0].mask,
        keys: keys[0].keys,
        script: encodeScript(threshold),
      },
    ],
    extra: buildCollectibleMemo(content),
  });
  return client.collection.request('sign', raw);
};
