import forge from 'node-forge';
import qs from 'qs';
import { validate, v4 } from 'uuid';
import { FixedNumber } from 'ethers';
import { GhostKey, GhostKeyRequest, MultisigTransaction, PaymentParams, SafeTransactionRecipient, SafeUtxoOutput } from '../types';
import { Input, Output } from '../../mvm/types';
import { Encoder, magic } from '../../mvm';
import { base64RawURLEncode } from './base64';
import { TIPBodyForSequencerRegister } from './tip';
import { getPublicFromMainnetAddress, buildMixAddress, parseMixAddress } from './address';
import { encodeScript } from './multisigs';
import { blake3Hash, newHash, sha512Hash } from './uniq';
import { edwards25519 as ed } from './ed25519';

export const TxVersionHashSignature = 0x05;
export const OutputTypeScript = 0x00;
export const OutputTypeWithdrawalSubmit = 0xa1;

/**
 * Build Payment Uri on https://mixin.one
 * Destination can be set with
 *   1. uuid: uuid of the Mixin user or bot
 *   2. mainnetAddress: Mixin mainnet address started with "XIN"
 *   3. mixAddress: address encoded with members and threshold and started with "MIX"
 *   4. members and threshold: multisigs members' uuid or mainnet address, and threshold
 */
export const buildMixinOneSafePaymentUri = (params: PaymentParams) => {
  let address = '';
  if (params.uuid && validate(params.uuid)) address = params.uuid;
  else if (params.mainnetAddress && getPublicFromMainnetAddress(params.mainnetAddress)) address = params.mainnetAddress;
  else if (params.mixAddress && parseMixAddress(params.mixAddress)) address = params.mixAddress;
  else if (params.members && params.threshold) {
    address = buildMixAddress({
      members: params.members,
      threshold: params.threshold,
    });
  } else throw new Error('fail to get payment destination address');

  const baseUrl = `https://mixin.one/pay/${address}`;
  const p = {
    asset: params.asset,
    amount: params.amount,
    memo: params.memo,
    trace: params.trace ?? v4(),
    return_to: params.returnTo && encodeURIComponent(params.returnTo),
  };
  const query = qs.stringify(p);
  return `${baseUrl}?${query}`;
};

export const signSafeRegistration = (user_id: string, tipPin: string, privateKey: Buffer) => {
  const public_key = forge.pki.ed25519.publicKeyFromPrivateKey({ privateKey }).toString('hex');

  const hash = newHash(Buffer.from(user_id));
  let signData = forge.pki.ed25519.sign({
    message: hash,
    privateKey,
  });
  const signature = base64RawURLEncode(signData);

  const tipBody = TIPBodyForSequencerRegister(user_id, public_key);
  signData = forge.pki.ed25519.sign({
    message: tipBody,
    privateKey: Buffer.from(tipPin, 'hex'),
  });

  return {
    public_key,
    signature,
    pin_base64: signData.toString('hex'),
  };
};

export const deriveGhostPublicKey = (r: Buffer, A: Buffer, B: Buffer, index: number) => {
  const x = ed.hashScalar(ed.keyMultPubPriv(A, r), index);
  const p1 = ed.newPoint(B);
  const p2 = ed.scalarBaseMultToPoint(x);
  const p4 = p1.add(p2);
  // @ts-ignore
  return Buffer.from(p4.toRawBytes());
};

export const getMainnetAddressGhostKey = (recipient: GhostKeyRequest, hexSeed = '') => {
  if (recipient.receivers.length === 0) return undefined;
  if (hexSeed && hexSeed.length !== 128) return undefined;

  const publics = recipient.receivers.map(d => getPublicFromMainnetAddress(d));
  if (!publics.every(p => !!p)) return undefined;

  const seed = hexSeed ? Buffer.from(hexSeed, 'hex') : Buffer.from(forge.random.getBytesSync(64), 'binary');
  const r = Buffer.from(ed.scalar.toBytes(ed.setUniformBytes(seed)));
  const keys = publics.map(addressPubic => {
    const spendKey = addressPubic!.subarray(0, 32);
    const viewKey = addressPubic!.subarray(32, 64);
    const k = deriveGhostPublicKey(r, viewKey, spendKey, recipient.index);
    return k.toString('hex');
  });
  return {
    mask: ed.publicFromPrivate(r).toString('hex'),
    keys,
  };
};

export const buildSafeTransactionRecipient = (members: string[], threshold: number, amount: string): SafeTransactionRecipient => ({
  members,
  threshold,
  amount,
  mixAddress: buildMixAddress({ members, threshold }),
});

export const getUnspentOutputsForRecipients = (outputs: SafeUtxoOutput[], rs: SafeTransactionRecipient[]) => {
  const totalOutput = rs.reduce((prev, cur) => prev.addUnsafe(FixedNumber.from(cur.amount)), FixedNumber.from('0'));

  let totalInput = FixedNumber.from('0');
  for (let i = 0; i < outputs.length; i++) {
    const o = outputs[i];
    if (o.state !== 'unspent') continue;
    totalInput = totalInput.addUnsafe(FixedNumber.from(o.amount));
    if (totalInput.subUnsafe(totalOutput).isNegative()) continue;

    return {
      utxos: outputs.slice(0, i + 1),
      change: totalInput.subUnsafe(totalOutput),
    };
  }
  throw new Error('insufficient total input outputs');
};

export const encodeSafeTransaction = (tx: MultisigTransaction, sigs: string[][] = []) => {
  const enc = new Encoder(Buffer.from([]));

  enc.write(magic);
  enc.write(Buffer.from([0x00, tx.version]));
  enc.write(Buffer.from(tx.asset, 'hex'));

  enc.writeInt(tx.inputs.length);
  tx.inputs.forEach(input => {
    enc.encodeInput(input);
  });

  enc.writeInt(tx.outputs.length);
  tx.outputs.forEach(output => {
    enc.encodeOutput(output);
  });

  // FIXME: references
  enc.writeInt(0);

  const extra = Buffer.from(tx.extra);
  enc.writeUint32(extra.byteLength);
  enc.write(extra);

  enc.writeInt(sigs.length);
  sigs.forEach(s => {
    enc.encodeSignature(s);
  });

  return enc.buf.toString('hex');
};

export const buildSafeTransaction = (utxos: SafeUtxoOutput[], rs: SafeTransactionRecipient[], gs: GhostKey[], extra: string) => {
  if (utxos.length === 0) throw new Error('empty inputs');
  if (Buffer.from(extra).byteLength > 512) throw new Error('extra data is too long');

  let asset = '';
  const inputs: Input[] = [];
  utxos.forEach(o => {
    if (!asset) asset = o.asset;
    if (o.asset !== asset) throw new Error('inconsistent asset in outputs');
    inputs.push({ hash: o.transaction_hash, index: o.output_index });
  });

  const outputs: Output[] = [];
  for (let i = 0; i < rs.length; i++) {
    const r = rs[i];
    if (r.destination) {
      outputs.push({
        type: OutputTypeWithdrawalSubmit,
        amount: r.amount,
        withdrawal: {
          address: r.destination,
          tag: r.tag ?? '',
        },
      });
      continue;
    }

    outputs.push({
      type: OutputTypeScript,
      amount: r.amount,
      keys: gs[i].keys,
      mask: gs[i].mask,
      script: encodeScript(r.threshold),
    });
  }

  return {
    version: TxVersionHashSignature,
    asset,
    extra,
    inputs,
    outputs,
  };
};

export const signSafeTransaction = async (tx: MultisigTransaction, views: string[], privateKey: string) => {
  const raw = encodeSafeTransaction(tx);
  const msg = await blake3Hash(Buffer.from(raw, 'hex'));

  const spenty = sha512Hash(Buffer.from(privateKey.slice(0, 64), 'hex'));
  const y = ed.setBytesWithClamping(spenty.subarray(0, 32));

  const signaturesMap = [];
  for (let i = 0; i < tx.inputs.length; i++) {
    const viewBuffer = Buffer.from(views[i], 'hex');
    const x = ed.setCanonicalBytes(viewBuffer);
    const t = ed.scalar.add(x, y);
    const key = Buffer.from(ed.scalar.toBytes(t));
    const sig = ed.sign(msg, key);
    const sigs = [sig.toString('hex')]; // for 1/1 bot transaction
    signaturesMap.push(sigs);
  }

  return encodeSafeTransaction(tx, signaturesMap);
};
