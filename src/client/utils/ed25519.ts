import { ed25519, x25519 } from '@noble/curves/ed25519.js';
import { numberToBytesLE, bytesToNumberLE } from '@noble/curves/utils.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { blake3Hash, sha512Hash } from './uniq';
import { putUvarInt } from './encoder';

const scMinusOne = Buffer.from('ecd3f55c1a631258d69cf7a2def9de1400000000000000000000000000000010', 'hex');
const base = ed25519.Point.BASE;
const fn = ed25519.Point.Fn;
const toBytes = (data: Buffer | Uint8Array) => new Uint8Array(data);

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
  const m = fn.create(bytesToNumberLE(toBytes(wideBytes.subarray(0, 32))));
  return m;
};

const setUniformBytes = (x: Buffer) => {
  if (x.byteLength !== 64) throw new Error('edwards25519: invalid setUniformBytes input length');
  const wideBytes = Buffer.alloc(64);
  x.copy(wideBytes);
  const m = fn.create(bytesToNumberLE(toBytes(wideBytes)));
  return m;
};

const setCanonicalBytes = (x: Buffer) => {
  if (x.byteLength !== 32) throw new Error('invalid scalar length');
  if (!isReduced(x)) throw new Error('invalid scalar encoding');
  const s = fn.create(bytesToNumberLE(toBytes(x)));
  return s;
};

const scalarBaseMult = (x: bigint) => {
  const res = base.multiply(x);
  return Buffer.from(res.toBytes());
};

const scalarBaseMultToPoint = (x: bigint) => base.multiply(x);

export const publicFromPrivate = (priv: Buffer) => {
  const x = setCanonicalBytes(priv);
  const v = scalarBaseMult(x);
  return v;
};

export const sign = (msg: Buffer, key: Buffer) => {
  const digest1 = sha512Hash(key.subarray(0, 32));
  const messageDigest = sha512Hash(Buffer.concat([digest1.subarray(32), msg]));

  const z = setUniformBytes(messageDigest);
  const r = scalarBaseMult(z);

  const pub = publicFromPrivate(key);
  const hramDigest = sha512Hash(Buffer.concat([r, pub, msg]));

  const x = setUniformBytes(hramDigest);
  const y = setCanonicalBytes(key);
  const s = numberToBytesLE(fn.add(fn.mul(x, y), z), 32);
  return Buffer.concat([r, s]);
};

const newPoint = (x: Buffer) => ed25519.Point.fromBytes(toBytes(x));

const keyMultPubPriv = (pub: Buffer, priv: Buffer) => {
  const q = newPoint(pub);
  const x = setCanonicalBytes(priv);
  const res = q.multiply(x);
  return Buffer.from(res.toBytes());
};

const hashScalar = (k: Buffer, index: number) => {
  const tmp = Buffer.from(putUvarInt(index));
  const src = Buffer.alloc(64);
  let hash = blake3Hash(Buffer.concat([k, tmp]));
  hash.copy(src, 0, 0, 32);
  hash = blake3Hash(hash);
  hash.copy(src, 32, 0, 32);
  const s = setUniformBytes(src);

  hash = blake3Hash(Buffer.from(numberToBytesLE(s, 32)));
  hash.copy(src, 0, 0, 32);
  hash = blake3Hash(hash);
  hash.copy(src, 32, 0, 32);
  return setUniformBytes(src);
};

export const getRandomBytes = (len?: number) => Buffer.from(randomBytes(len ?? ed25519.Point.Fp.BYTES));

export const getKeyPair = () => {
  const seed = getRandomBytes();
  const publicKey = Buffer.from(ed25519.getPublicKey(toBytes(seed)));
  return {
    privateKey: Buffer.concat([seed, publicKey]),
    publicKey,
    seed,
  };
};

export const newKeyFromSeed = (seed: Buffer) => {
  const s = setUniformBytes(seed);
  return Buffer.from(numberToBytesLE(s, 32));
};

export const edwards25519 = {
  scalar: fn,
  x25519,
  edwardsToMontgomery: (point: Buffer) => Buffer.from(ed25519.utils.toMontgomery(toBytes(point))),
  edwardsToMontgomeryPriv: (secret: Buffer) => Buffer.from(ed25519.utils.toMontgomerySecret(toBytes(secret))),

  setBytesWithClamping,
  setCanonicalBytes,
  setUniformBytes,

  isReduced,
  publicFromPrivate,
  scalarBaseMult,
  scalarBaseMultToPoint,

  newKeyFromSeed,
  sign,

  newPoint,
  keyMultPubPriv,
  hashScalar,
};
