import { parse } from 'uuid';
import BigNumber from 'bignumber.js';
import type { Aggregated, Input, Output } from '../types';
import { parseUnits } from './amount';

const MaximumEncodingInt = 0xffff;

const AggregatedSignaturePrefix = 0xff01;

export const magic = Buffer.from([0x77, 0x77]);
const empty = Buffer.from([0x00, 0x00]);

export const integerToBytes = (x: number) => {
  if (!Number.isSafeInteger(x) || x < 0) throw new Error(`invalid integer ${x}`);
  const bytes: number[] = [];
  if (x === 0) return bytes;
  let i = x;
  do {
    bytes.unshift(i % 256);
    i = Math.floor(i / 256);
  } while (i !== 0);
  return bytes;
};

export const bigNumberToBytes = (x: BigNumber) => {
  if (!x.isInteger() || x.isLessThan(0)) throw new Error(`invalid integer ${x}`);
  const bytes = [];
  let i = x;
  do {
    bytes.unshift(i.mod(256).toNumber());
    i = i.dividedToIntegerBy(256);
  } while (!i.isZero());
  return Buffer.from(bytes);
};

export const putUvarInt = (x: number) => {
  if (!Number.isSafeInteger(x) || x < 0) throw new Error(`invalid integer ${x}`);
  const buf = [];
  let i = 0;
  while (x >= 0x80) {
    buf[i] = (x % 0x80) | 0x80;
    x = Math.floor(x / 0x80);
    i++;
  }
  buf[i] = x;
  return buf;
};

export class Encoder {
  buf: Buffer;

  constructor(buf: Buffer | undefined) {
    this.buf = Buffer.from('');
    if (buf) {
      this.buf = buf;
    }
  }

  buffer() {
    return this.buf;
  }

  hex() {
    return this.buf.toString('hex');
  }

  write(buf: Buffer) {
    this.buf = Buffer.concat([this.buf, buf]);
  }

  writeBytes(buf: Buffer) {
    const len = buf.byteLength;
    this.writeInt(len);
    this.write(buf);
  }

  writeSlice(buf: Buffer) {
    const l = buf.length;
    if (l > 128) throw new Error(`slice too long, length ${l}, maximum 128`);
    this.write(Buffer.from([l]));
    this.write(buf);
  }

  writeInt(i: number) {
    this.writeUint16(i);
  }

  writeUint16(i: number) {
    if (!Number.isInteger(i) || i < 0 || i > MaximumEncodingInt) {
      throw new Error(`invalid integer ${i}, maximum ${MaximumEncodingInt}`);
    }
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(i);
    this.write(buf);
  }

  writeUint32(i: number) {
    if (!Number.isInteger(i) || i < 0 || i > 0xffffffff) {
      throw new Error(`invalid integer ${i}, maximum ${0xffffffff}`);
    }
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(i);
    this.write(buf);
  }

  writeUint64(i: bigint) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(i);
    this.write(buf);
  }

  writeInteger(i: BigNumber) {
    const b = bigNumberToBytes(i);
    this.writeInt(b.byteLength);
    this.write(b);
  }

  // TODO convert array like to array
  writeUUID(id: string) {
    const uuid: any = parse(id);
    for (let i = 0; i < uuid.length; i += 1) {
      this.write(Buffer.from([uuid[i]]));
    }
  }

  encodeInput(input: Input) {
    const i = input;
    this.write(Buffer.from(i.hash, 'hex'));
    this.writeInt(i.index);

    const genesis = i.genesis ?? '';
    this.writeInt(Buffer.byteLength(genesis));
    this.write(Buffer.from(genesis));
    const d = i.deposit;
    if (typeof d === 'undefined') {
      this.write(empty);
    } else {
      // TODO... to test...
      this.write(magic);
      this.write(Buffer.from(d.chain, 'hex'));

      const asset = Buffer.from(d.asset);
      this.writeInt(asset.byteLength);
      this.write(asset);

      const tx = Buffer.from(d.transaction);
      this.writeInt(tx.byteLength);
      this.write(tx);

      this.writeUint64(d.index);
      this.writeInteger(parseUnits(d.amount, 8));
    }
    const m = i.mint;
    if (typeof m === 'undefined') {
      this.write(empty);
    } else {
      this.write(magic);
      const group = m.group ?? '';
      this.writeInt(Buffer.byteLength(group));
      this.write(Buffer.from(group));

      this.writeUint64(m.batch);
      this.writeInteger(parseUnits(m.amount, 8));
    }
  }

  encodeOutput(output: Output) {
    const o = output;
    const type = o.type ?? 0;
    if (!Number.isInteger(type) || type < 0 || type > 255) throw new Error(`invalid output type ${o.type}`);
    this.write(Buffer.from([0x00, type]));
    this.writeInteger(parseUnits(o.amount, 8));

    this.writeInt(o.keys.length);
    o.keys.forEach(k => {
      // Buffer.from(k, 'hex') silently drops non-hex chars, so a typo'd key
      // would shift the whole framing and burn funds to a wrong key.
      if (!/^[0-9a-fA-F]{64}$/.test(k)) throw new Error(`invalid output key ${k}`);
      this.write(Buffer.from(k, 'hex'));
    });

    const maskHex = o.mask || '';
    if (maskHex && !/^[0-9a-fA-F]{64}$/.test(maskHex)) throw new Error(`invalid output mask ${o.mask}`);
    const mask = maskHex ? Buffer.from(maskHex, 'hex') : Buffer.alloc(32, 0);
    this.write(mask);

    const scriptHex = o.script || '';
    const s = Buffer.from(scriptHex, 'hex');
    this.writeInt(s.byteLength);
    this.write(s);

    const w = o.withdrawal;
    if (!w) {
      this.write(empty);
    } else {
      this.write(magic);

      const addr = Buffer.from(w.address);
      this.writeInt(addr.byteLength);
      this.write(addr);

      const tag = Buffer.from(w.tag);
      this.writeInt(tag.byteLength);
      this.write(tag);
    }
  }

  encodeAggregatedSignature(js: Aggregated) {
    this.writeInt(MaximumEncodingInt);
    this.writeInt(AggregatedSignaturePrefix);
    this.write(Buffer.from(js.signature, 'hex'));

    if (js.signers.length === 0) {
      this.write(Buffer.from([0x00]));
      this.writeInt(0);
      return;
    }

    js.signers.forEach((m, i) => {
      if (!Number.isInteger(m) || m < 0) {
        throw new Error(`invalid signer ${m}`);
      }
      if (i > 0 && m <= js.signers[i - 1]) {
        throw new Error('signers not sorted');
      }
      if (m > MaximumEncodingInt) {
        throw new Error('signer overflow');
      }
    });

    const max = js.signers[js.signers.length - 1];

    if (((((max / 8) | 0) + 1) | 0) > js.signature.length * 2) {
      // TODO... not check...
      this.write(Buffer.from([0x01]));
      this.writeInt(js.signature.length);
      js.signers.forEach(m => this.writeInt(m));
      return;
    }

    const masks = Buffer.alloc((((max / 8) | 0) + 1) | 0);
    js.signers.forEach(m => {
      masks[(m / 8) | 0] ^= 1 << ((m % 8) | 0);
    });
    this.write(Buffer.from([0x00]));
    this.writeInt(masks.length);
    this.write(masks);
  }

  encodeSignature(sm: { [key: number]: string }) {
    const ss = Object.entries(sm)
      .map(([k, v]) => ({ index: k, sig: v }))
      .sort((a, b) => Number(a.index) - Number(b.index));

    this.writeInt(ss.length);
    ss.forEach(s => {
      this.writeUint16(Number(s.index));
      this.write(Buffer.from(s.sig, 'hex'));
    });
  }
}

export default Encoder;
