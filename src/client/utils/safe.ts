import { SHA3 } from 'sha3';
import forge from 'node-forge';
import { FixedNumber } from 'ethers';
import { GhostKey, MultisigTransaction, SafeTransactionRecipient, SafeUtxoOutput } from '../types';
import { Input, Output } from '../../mvm/types';
import { Encoder, magic } from '../../mvm';
import { base64RawURLEncode } from './base64';
import { TIPBodyForSequencerRegister } from './tip';
import { GetMixAddress } from './address';
import { encodeScript } from './multisigs';
import { blake3Hash, sha512Hash } from './uniq';
import { edwards25519 as ed } from './ed25519';

export const TxVersionHashSignature = 0x05;
export const OutputTypeScript = 0x00;
export const OutputTypeWithdrawalSubmit = 0xa1;

export const signSafeRegistration = (user_id: string, tipPin: string, seed: Buffer) => {
  const keys = forge.pki.ed25519.generateKeyPair({ seed });
  const public_key = keys.publicKey.toString('hex');

  const hash = new SHA3(256).update(user_id).digest();
  let signData = forge.pki.ed25519.sign({
    message: hash,
    privateKey: keys.privateKey,
  });
  const signature = base64RawURLEncode(signData);

  const tipBody = TIPBodyForSequencerRegister(user_id, public_key);
  signData = forge.pki.ed25519.sign({
    message: Buffer.from(tipBody, 'hex'),
    privateKey: Buffer.from(tipPin, 'hex'),
  });

  return {
    public_key,
    signature,
    pin_base64: signData.toString('hex'),
  };
};

export const buildSafeTransactionRecipient = (members: string[], threshold: number, amount: string): SafeTransactionRecipient => ({
  members,
  threshold,
  amount,
  mixAddress: GetMixAddress({ members, threshold }),
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

export const buildSafeRawTransaction = (utxos: SafeUtxoOutput[], rs: SafeTransactionRecipient[], gs: GhostKey[], extra: string) => {
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

export const buildSafeTransaction = (outputs: SafeUtxoOutput[], rs: SafeTransactionRecipient[], gs: GhostKey[], memo: string) => {
  if (outputs.length === 0) throw new Error('empty outputs');
  if (Buffer.from(memo).byteLength > 512) throw new Error('memo data is too long');

  const { utxos, change } = getUnspentOutputsForRecipients(outputs, rs);
  if (!change.isZero() && !change.isNegative()) {
    rs.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
  }

  return buildSafeRawTransaction(utxos, rs, gs, memo);
};

export const signSafeTransaction = async (tx: MultisigTransaction, views: string[], tipPin: string) => {
  const raw = encodeSafeTransaction(tx);
  const msg = await blake3Hash(Buffer.from(raw, 'hex'));

  const spenty = sha512Hash(Buffer.from(tipPin.slice(0, 64), 'hex'));
  const y = ed.setBytesWithClamping(Buffer.from(spenty, 'hex').subarray(0, 32));

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
