import { parse as UUIDParse, stringify } from 'uuid';
import { NFOMemo } from '../types';
import { base64RawURLEncode } from './base64';
import { newHash } from './uniq';
import { Encoder, Decoder } from '../../mvm';

const Prefix = 'NFO';
const Version = 0x00;

const DefaultChain = '43d61dcd-e413-450d-80b8-101d5e903357';
const DefaultClass = '3c8c161a18ae2c8b14fda1216fff7da88c419b5d';

export function buildCollectibleMemo(collection_id: string, token_id: number, content: string): string {
  const encoder = new Encoder(Buffer.from(Prefix, 'utf8'));
  encoder.write(Buffer.from([Version]));

  encoder.write(Buffer.from([1]));
  encoder.writeUint64(BigInt(1));
  encoder.writeUUID(DefaultChain);

  encoder.writeSlice(Buffer.from(DefaultClass, 'hex'));
  encoder.writeSlice(Buffer.from(UUIDParse(collection_id) as Buffer));
  encoder.writeSlice(Buffer.from([token_id]));

  encoder.writeSlice(Buffer.from(newHash(content), 'hex'));
  return base64RawURLEncode(encoder.buf);
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

    nm.token = decoder.readBytes();
  }

  nm.extra = decoder.readBytes();
  return nm;
};
