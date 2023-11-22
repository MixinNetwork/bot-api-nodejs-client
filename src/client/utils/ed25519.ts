import { ed25519 } from '@noble/curves/ed25519';
import { Field } from '@noble/curves/abstract/modular';
import { numberToBytesLE, bytesToNumberLE } from '@noble/curves/abstract/utils';
import { sha512Hash } from './uniq';

const scMinusOne = Buffer.from('ecd3f55c1a631258d69cf7a2def9de1400000000000000000000000000000010', 'hex');
const fn = Field(ed25519.CURVE.n, undefined, true);

const isReduced = (x: Buffer) => {
  for (let i = x.byteLength - 1; i >= 0; i--) {
    if (x.at(i)! > scMinusOne.at(i)!) return false;
    if (x.at(i)! < scMinusOne.at(i)!) return true;
  }
  return true;
};

const setBytesWithClamping = (x: Buffer) => {
  if (x.byteLength !== 32) throw new Error('edwards25519: invalid SetBytesWithClamping input length');
  const wideBytes = Buffer.alloc(64);
  x.copy(wideBytes, 0, 0, 32);
  wideBytes[0] &= 248;
  wideBytes[31] &= 63;
  wideBytes[31] |= 64;
  const m = fn.create(bytesToNumberLE(wideBytes.subarray(0, 32)));
  return m;
};

const setUniformBytes = (x: Buffer) => {
  if (x.byteLength !== 64) throw new Error('edwards25519: invalid setUniformBytes input length');
  const wideBytes = Buffer.alloc(64);
  x.copy(wideBytes);
  const m = fn.create(bytesToNumberLE(wideBytes));
  return m;
};

const setCanonicalBytes = (x: Buffer) => {
  if (x.byteLength !== 32) throw new Error('invalid scalar length');
  if (!isReduced(x)) throw new Error('invalid scalar encoding');
  const s = fn.create(bytesToNumberLE(x));
  return s;
};

const scalarBaseMult = (x: bigint) => {
  const base = ed25519.ExtendedPoint.fromHex('5866666666666666666666666666666666666666666666666666666666666666');
  const res = base.multiply(x);
  // @ts-ignore
  return res.toRawBytes();
};

const publicFromPrivate = (priv: Buffer) => {
  const x = setCanonicalBytes(priv);
  const v = scalarBaseMult(x);
  return Buffer.from(v);
};

const sign = (msg: Buffer, key: Buffer) => {
  const digest1 = Buffer.from(sha512Hash(key.subarray(0, 32)), 'hex');
  const messageDigest = Buffer.from(sha512Hash(Buffer.concat([digest1.subarray(32), msg])), 'hex');

  const z = setUniformBytes(messageDigest);
  const r = scalarBaseMult(z);

  const pub = publicFromPrivate(key);
  const hramDigest = Buffer.from(sha512Hash(Buffer.concat([r, pub, msg])), 'hex');

  const x = setUniformBytes(hramDigest);
  const y = setCanonicalBytes(key);
  const s = numberToBytesLE(fn.add(fn.mul(x, y), z), 32);
  return Buffer.concat([r, s]);
};

export const edwards25519 = {
  scalar: fn,

  setBytesWithClamping,
  setCanonicalBytes,
  setUniformBytes,

  isReduced,
  publicFromPrivate,
  scalarBaseMult,
  sign,
};
