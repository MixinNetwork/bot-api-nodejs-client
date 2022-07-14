/* eslint-disable prefer-destructuring */
import { randomBytes, createCipheriv, createHash } from 'crypto';
import { pki, util, md } from 'node-forge';
import { Uint64LE } from 'int64-buffer';
import { Keystore } from '../client';

export const getSignPIN = (keystore: Keystore, pin?: any, iterator?: any) => {
  const { session_id, private_key, pin_token, pin: _pin } = keystore;
  pin = pin || _pin;
  if (!pin) throw new Error('PIN is required');
  const blockSize = 16;

  const _privateKey: any = toBuffer(private_key, 'base64');
  const pinKey = _privateKey.length === 64 ? signEncryptEd25519PIN(pin_token, _privateKey) : signPin(pin_token, private_key, session_id);

  const time = new Uint64LE((Date.now() / 1000) | 0).toBuffer();
  if (iterator === undefined || iterator === '') {
    iterator = Date.now() * 1000000;
  }
  iterator = new Uint64LE(iterator).toBuffer();
  pin = Buffer.from(pin, 'utf8');
  let buf: any = Buffer.concat([pin, Buffer.from(time), Buffer.from(iterator)]);
  const padding = blockSize - (buf.length % blockSize);
  const paddingArray = [];
  for (let i = 0; i < padding; i++) {
    paddingArray.push(padding);
  }
  buf = Buffer.concat([buf, Buffer.from(paddingArray)]);
  const iv16 = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', pinKey, iv16);
  cipher.setAutoPadding(false);
  let encrypted_pin_buff = cipher.update(buf, 'utf-8');
  encrypted_pin_buff = Buffer.concat([iv16, encrypted_pin_buff]);
  return Buffer.from(encrypted_pin_buff).toString('base64');
};

export function toBuffer(content: any, encoding: any = 'utf8') {
  if (typeof content === 'object') {
    content = JSON.stringify(content);
  }
  return Buffer.from(content, encoding);
}

export function getEd25519Sign(payload: any, privateKey: any) {
  const header = toBuffer({ alg: 'EdDSA', typ: 'JWT' }).toString('base64');
  payload = base64url(toBuffer(payload));
  const result = [header, payload];
  const sign = base64url(Buffer.from(pki.ed25519.sign({ message: result.join('.'), encoding: 'utf8', privateKey })));
  result.push(sign);
  return result.join('.');
}

export const signRequest = (method: string, url: string, body: object | string = ''): string => {
  const _method = method.toUpperCase();

  const _url = new URL(url);

  let _body = body;
  if (typeof body === 'object') _body = JSON.stringify(body);
  return md.sha256
    .create()
    .update(_method + _url.pathname + _url.search + _body, 'utf8')
    .digest()
    .toHex();
};
function signEncryptEd25519PIN(pinToken: any, privateKey: string) {
  pinToken = Buffer.from(pinToken, 'base64');
  return scalarMulti(privateKeyToCurve25519(privateKey), pinToken.slice(0, 32));
}

function signPin(pin_token: any, private_key: any, session_id: any) {
  pin_token = Buffer.from(pin_token, 'base64');
  private_key = pki.privateKeyFromPem(private_key);
  const pinKey = private_key.decrypt(pin_token, 'RSA-OAEP', {
    md: md.sha256.create(),
    label: session_id,
  });
  return hexToBytes(util.binary.hex.encode(pinKey));
}

function hexToBytes(hex: any) {
  const bytes = new Uint8Array(32);
  for (let c = 0; c < hex.length; c += 2) {
    bytes[c / 2] = parseInt(hex.substr(c, 2), 16);
  }
  return bytes;
}

function scalarMulti(curvePriv: any, publicKey: any) {
  curvePriv[0] &= 248;
  curvePriv[31] &= 127;
  curvePriv[31] |= 64;
  const sharedKey = new Uint8Array(32);
  cryptoScalarMulti(sharedKey, curvePriv, publicKey);
  return sharedKey;
}

export function base64url(buffer: Buffer) {
  return Buffer.from(buffer).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function privateKeyToCurve25519(privateKey: any) {
  const seed = privateKey.slice(0, 32);
  const sha512 = createHash('sha512');
  sha512.write(seed, 'binary');
  const digest = sha512.digest();
  digest[0] &= 248;
  digest[31] &= 127;
  digest[31] |= 64;
  return digest.slice(0, 32);
}

function cryptoScalarMulti(q: any, n: any, p: any) {
  const z = new Uint8Array(32);
  const x = new Float64Array(80);
  let r;
  let i;
  const a = gf();
  const b = gf();
  const c = gf();
  const d = gf();
  const e = gf();
  const f = gf();
  for (i = 0; i < 31; i++) {
    z[i] = n[i];
  }
  z[31] = (n[31] & 127) | 64;
  z[0] &= 248;
  unpack25519(x, p);
  for (i = 0; i < 16; i++) {
    b[i] = x[i];
    d[i] = 0;
    a[i] = 0;
    c[i] = 0;
  }
  a[0] = 1;
  d[0] = 1;
  for (i = 254; i >= 0; --i) {
    r = (z[i >>> 3] >>> (i & 7)) & 1;
    sel25519(a, b, r);
    sel25519(c, d, r);
    A(e, a, c);
    Z(a, a, c);
    A(c, b, d);
    Z(b, b, d);
    S(d, e);
    S(f, a);
    M(a, c, a);
    M(c, b, e);
    A(e, a, c);
    Z(a, a, c);
    S(b, a);
    Z(c, d, f);
    M(a, c, gf([0xdb41, 1]));
    A(a, a, d);
    M(c, c, a);
    M(a, d, f);
    M(d, b, x);
    S(b, e);
    sel25519(a, b, r);
    sel25519(c, d, r);
  }
  for (i = 0; i < 16; i++) {
    x[i + 16] = a[i];
    x[i + 32] = c[i];
    x[i + 48] = b[i];
    x[i + 64] = d[i];
  }
  const x32 = x.subarray(32);
  const x16 = x.subarray(16);
  inv25519(x32, x32);
  M(x16, x16, x32);
  pack25519(q, x16);
  return 0;
}

function gf(init: any = undefined) {
  let i;
  const r = new Float64Array(16);
  if (init) {
    for (i = 0; i < init.length; i++) {
      r[i] = init[i];
    }
  }
  return r;
}

function unpack25519(o: any, n: any) {
  let i;
  for (i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8);
  }
  o[15] &= 0x7fff;
}

function sel25519(p: any, q: any, b: any) {
  let t;
  const c = ~(b - 1);
  for (let i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i]);
    p[i] ^= t;
    q[i] ^= t;
  }
}

function A(o: any, a: any, b: any) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i];
  }
}

function Z(o: any, a: any, b: any) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i];
  }
}

function M(o: any, a: any, b: any) {
  let v;
  let c;
  let t0 = 0;
  let t1 = 0;
  let t2 = 0;
  let t3 = 0;
  let t4 = 0;
  let t5 = 0;
  let t6 = 0;
  let t7 = 0;
  let t8 = 0;
  let t9 = 0;
  let t10 = 0;
  let t11 = 0;
  let t12 = 0;
  let t13 = 0;
  let t14 = 0;
  let t15 = 0;
  let t16 = 0;
  let t17 = 0;
  let t18 = 0;
  let t19 = 0;
  let t20 = 0;
  let t21 = 0;
  let t22 = 0;
  let t23 = 0;
  let t24 = 0;
  let t25 = 0;
  let t26 = 0;
  let t27 = 0;
  let t28 = 0;
  let t29 = 0;
  let t30 = 0;
  const b0 = b[0];
  const b1 = b[1];
  const b2 = b[2];
  const b3 = b[3];
  const b4 = b[4];
  const b5 = b[5];
  const b6 = b[6];
  const b7 = b[7];
  const b8 = b[8];
  const b9 = b[9];
  const b10 = b[10];
  const b11 = b[11];
  const b12 = b[12];
  const b13 = b[13];
  const b14 = b[14];
  const b15 = b[15];
  v = a[0];
  t0 += v * b0;
  t1 += v * b1;
  t2 += v * b2;
  t3 += v * b3;
  t4 += v * b4;
  t5 += v * b5;
  t6 += v * b6;
  t7 += v * b7;
  t8 += v * b8;
  t9 += v * b9;
  t10 += v * b10;
  t11 += v * b11;
  t12 += v * b12;
  t13 += v * b13;
  t14 += v * b14;
  t15 += v * b15;
  v = a[1];
  t1 += v * b0;
  t2 += v * b1;
  t3 += v * b2;
  t4 += v * b3;
  t5 += v * b4;
  t6 += v * b5;
  t7 += v * b6;
  t8 += v * b7;
  t9 += v * b8;
  t10 += v * b9;
  t11 += v * b10;
  t12 += v * b11;
  t13 += v * b12;
  t14 += v * b13;
  t15 += v * b14;
  t16 += v * b15;
  v = a[2];
  t2 += v * b0;
  t3 += v * b1;
  t4 += v * b2;
  t5 += v * b3;
  t6 += v * b4;
  t7 += v * b5;
  t8 += v * b6;
  t9 += v * b7;
  t10 += v * b8;
  t11 += v * b9;
  t12 += v * b10;
  t13 += v * b11;
  t14 += v * b12;
  t15 += v * b13;
  t16 += v * b14;
  t17 += v * b15;
  v = a[3];
  t3 += v * b0;
  t4 += v * b1;
  t5 += v * b2;
  t6 += v * b3;
  t7 += v * b4;
  t8 += v * b5;
  t9 += v * b6;
  t10 += v * b7;
  t11 += v * b8;
  t12 += v * b9;
  t13 += v * b10;
  t14 += v * b11;
  t15 += v * b12;
  t16 += v * b13;
  t17 += v * b14;
  t18 += v * b15;
  v = a[4];
  t4 += v * b0;
  t5 += v * b1;
  t6 += v * b2;
  t7 += v * b3;
  t8 += v * b4;
  t9 += v * b5;
  t10 += v * b6;
  t11 += v * b7;
  t12 += v * b8;
  t13 += v * b9;
  t14 += v * b10;
  t15 += v * b11;
  t16 += v * b12;
  t17 += v * b13;
  t18 += v * b14;
  t19 += v * b15;
  v = a[5];
  t5 += v * b0;
  t6 += v * b1;
  t7 += v * b2;
  t8 += v * b3;
  t9 += v * b4;
  t10 += v * b5;
  t11 += v * b6;
  t12 += v * b7;
  t13 += v * b8;
  t14 += v * b9;
  t15 += v * b10;
  t16 += v * b11;
  t17 += v * b12;
  t18 += v * b13;
  t19 += v * b14;
  t20 += v * b15;
  v = a[6];
  t6 += v * b0;
  t7 += v * b1;
  t8 += v * b2;
  t9 += v * b3;
  t10 += v * b4;
  t11 += v * b5;
  t12 += v * b6;
  t13 += v * b7;
  t14 += v * b8;
  t15 += v * b9;
  t16 += v * b10;
  t17 += v * b11;
  t18 += v * b12;
  t19 += v * b13;
  t20 += v * b14;
  t21 += v * b15;
  v = a[7];
  t7 += v * b0;
  t8 += v * b1;
  t9 += v * b2;
  t10 += v * b3;
  t11 += v * b4;
  t12 += v * b5;
  t13 += v * b6;
  t14 += v * b7;
  t15 += v * b8;
  t16 += v * b9;
  t17 += v * b10;
  t18 += v * b11;
  t19 += v * b12;
  t20 += v * b13;
  t21 += v * b14;
  t22 += v * b15;
  v = a[8];
  t8 += v * b0;
  t9 += v * b1;
  t10 += v * b2;
  t11 += v * b3;
  t12 += v * b4;
  t13 += v * b5;
  t14 += v * b6;
  t15 += v * b7;
  t16 += v * b8;
  t17 += v * b9;
  t18 += v * b10;
  t19 += v * b11;
  t20 += v * b12;
  t21 += v * b13;
  t22 += v * b14;
  t23 += v * b15;
  v = a[9];
  t9 += v * b0;
  t10 += v * b1;
  t11 += v * b2;
  t12 += v * b3;
  t13 += v * b4;
  t14 += v * b5;
  t15 += v * b6;
  t16 += v * b7;
  t17 += v * b8;
  t18 += v * b9;
  t19 += v * b10;
  t20 += v * b11;
  t21 += v * b12;
  t22 += v * b13;
  t23 += v * b14;
  t24 += v * b15;
  v = a[10];
  t10 += v * b0;
  t11 += v * b1;
  t12 += v * b2;
  t13 += v * b3;
  t14 += v * b4;
  t15 += v * b5;
  t16 += v * b6;
  t17 += v * b7;
  t18 += v * b8;
  t19 += v * b9;
  t20 += v * b10;
  t21 += v * b11;
  t22 += v * b12;
  t23 += v * b13;
  t24 += v * b14;
  t25 += v * b15;
  v = a[11];
  t11 += v * b0;
  t12 += v * b1;
  t13 += v * b2;
  t14 += v * b3;
  t15 += v * b4;
  t16 += v * b5;
  t17 += v * b6;
  t18 += v * b7;
  t19 += v * b8;
  t20 += v * b9;
  t21 += v * b10;
  t22 += v * b11;
  t23 += v * b12;
  t24 += v * b13;
  t25 += v * b14;
  t26 += v * b15;
  v = a[12];
  t12 += v * b0;
  t13 += v * b1;
  t14 += v * b2;
  t15 += v * b3;
  t16 += v * b4;
  t17 += v * b5;
  t18 += v * b6;
  t19 += v * b7;
  t20 += v * b8;
  t21 += v * b9;
  t22 += v * b10;
  t23 += v * b11;
  t24 += v * b12;
  t25 += v * b13;
  t26 += v * b14;
  t27 += v * b15;
  v = a[13];
  t13 += v * b0;
  t14 += v * b1;
  t15 += v * b2;
  t16 += v * b3;
  t17 += v * b4;
  t18 += v * b5;
  t19 += v * b6;
  t20 += v * b7;
  t21 += v * b8;
  t22 += v * b9;
  t23 += v * b10;
  t24 += v * b11;
  t25 += v * b12;
  t26 += v * b13;
  t27 += v * b14;
  t28 += v * b15;
  v = a[14];
  t14 += v * b0;
  t15 += v * b1;
  t16 += v * b2;
  t17 += v * b3;
  t18 += v * b4;
  t19 += v * b5;
  t20 += v * b6;
  t21 += v * b7;
  t22 += v * b8;
  t23 += v * b9;
  t24 += v * b10;
  t25 += v * b11;
  t26 += v * b12;
  t27 += v * b13;
  t28 += v * b14;
  t29 += v * b15;
  v = a[15];
  t15 += v * b0;
  t16 += v * b1;
  t17 += v * b2;
  t18 += v * b3;
  t19 += v * b4;
  t20 += v * b5;
  t21 += v * b6;
  t22 += v * b7;
  t23 += v * b8;
  t24 += v * b9;
  t25 += v * b10;
  t26 += v * b11;
  t27 += v * b12;
  t28 += v * b13;
  t29 += v * b14;
  t30 += v * b15;
  t0 += 38 * t16;
  t1 += 38 * t17;
  t2 += 38 * t18;
  t3 += 38 * t19;
  t4 += 38 * t20;
  t5 += 38 * t21;
  t6 += 38 * t22;
  t7 += 38 * t23;
  t8 += 38 * t24;
  t9 += 38 * t25;
  t10 += 38 * t26;
  t11 += 38 * t27;
  t12 += 38 * t28;
  t13 += 38 * t29;
  t14 += 38 * t30;
  // t15 left as is
  // first car
  c = 1;
  v = t0 + c + 65535;
  c = Math.floor(v / 65536);
  t0 = v - c * 65536;
  v = t1 + c + 65535;
  c = Math.floor(v / 65536);
  t1 = v - c * 65536;
  v = t2 + c + 65535;
  c = Math.floor(v / 65536);
  t2 = v - c * 65536;
  v = t3 + c + 65535;
  c = Math.floor(v / 65536);
  t3 = v - c * 65536;
  v = t4 + c + 65535;
  c = Math.floor(v / 65536);
  t4 = v - c * 65536;
  v = t5 + c + 65535;
  c = Math.floor(v / 65536);
  t5 = v - c * 65536;
  v = t6 + c + 65535;
  c = Math.floor(v / 65536);
  t6 = v - c * 65536;
  v = t7 + c + 65535;
  c = Math.floor(v / 65536);
  t7 = v - c * 65536;
  v = t8 + c + 65535;
  c = Math.floor(v / 65536);
  t8 = v - c * 65536;
  v = t9 + c + 65535;
  c = Math.floor(v / 65536);
  t9 = v - c * 65536;
  v = t10 + c + 65535;
  c = Math.floor(v / 65536);
  t10 = v - c * 65536;
  v = t11 + c + 65535;
  c = Math.floor(v / 65536);
  t11 = v - c * 65536;
  v = t12 + c + 65535;
  c = Math.floor(v / 65536);
  t12 = v - c * 65536;
  v = t13 + c + 65535;
  c = Math.floor(v / 65536);
  t13 = v - c * 65536;
  v = t14 + c + 65535;
  c = Math.floor(v / 65536);
  t14 = v - c * 65536;
  v = t15 + c + 65535;
  c = Math.floor(v / 65536);
  t15 = v - c * 65536;
  t0 += c - 1 + 37 * (c - 1);
  // second car
  c = 1;
  v = t0 + c + 65535;
  c = Math.floor(v / 65536);
  t0 = v - c * 65536;
  v = t1 + c + 65535;
  c = Math.floor(v / 65536);
  t1 = v - c * 65536;
  v = t2 + c + 65535;
  c = Math.floor(v / 65536);
  t2 = v - c * 65536;
  v = t3 + c + 65535;
  c = Math.floor(v / 65536);
  t3 = v - c * 65536;
  v = t4 + c + 65535;
  c = Math.floor(v / 65536);
  t4 = v - c * 65536;
  v = t5 + c + 65535;
  c = Math.floor(v / 65536);
  t5 = v - c * 65536;
  v = t6 + c + 65535;
  c = Math.floor(v / 65536);
  t6 = v - c * 65536;
  v = t7 + c + 65535;
  c = Math.floor(v / 65536);
  t7 = v - c * 65536;
  v = t8 + c + 65535;
  c = Math.floor(v / 65536);
  t8 = v - c * 65536;
  v = t9 + c + 65535;
  c = Math.floor(v / 65536);
  t9 = v - c * 65536;
  v = t10 + c + 65535;
  c = Math.floor(v / 65536);
  t10 = v - c * 65536;
  v = t11 + c + 65535;
  c = Math.floor(v / 65536);
  t11 = v - c * 65536;
  v = t12 + c + 65535;
  c = Math.floor(v / 65536);
  t12 = v - c * 65536;
  v = t13 + c + 65535;
  c = Math.floor(v / 65536);
  t13 = v - c * 65536;
  v = t14 + c + 65535;
  c = Math.floor(v / 65536);
  t14 = v - c * 65536;
  v = t15 + c + 65535;
  c = Math.floor(v / 65536);
  t15 = v - c * 65536;
  t0 += c - 1 + 37 * (c - 1);
  o[0] = t0;
  o[1] = t1;
  o[2] = t2;
  o[3] = t3;
  o[4] = t4;
  o[5] = t5;
  o[6] = t6;
  o[7] = t7;
  o[8] = t8;
  o[9] = t9;
  o[10] = t10;
  o[11] = t11;
  o[12] = t12;
  o[13] = t13;
  o[14] = t14;
  o[15] = t15;
}

function S(o: any, a: any) {
  M(o, a, a);
}

function inv25519(o: any, i: any) {
  const c = gf();
  let a;
  for (a = 0; a < 16; a++) {
    c[a] = i[a];
  }
  for (a = 253; a >= 0; a--) {
    S(c, c);
    if (a !== 2 && a !== 4) {
      M(c, c, i);
    }
  }
  for (a = 0; a < 16; a++) {
    o[a] = c[a];
  }
}

function pack25519(o: any, n: any) {
  let i;
  let j;
  let b;
  const m = gf();
  const t = gf();
  for (i = 0; i < 16; i++) {
    t[i] = n[i];
  }
  car25519(t);
  car25519(t);
  car25519(t);
  for (j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed;
    for (i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1);
      m[i - 1] &= 0xffff;
    }
    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1);
    b = (m[15] >> 16) & 1;
    m[14] &= 0xffff;
    sel25519(t, m, 1 - b);
  }
  for (i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff;
    o[2 * i + 1] = t[i] >> 8;
  }
}

function car25519(o: any) {
  let i;
  let v;
  let c = 1;
  for (i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c - 1 + 37 * (c - 1);
}
