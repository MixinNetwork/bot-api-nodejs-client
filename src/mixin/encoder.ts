import { BN } from 'bn.js';
import { parse } from 'uuid';
import { Aggregated, Input, Output } from '../mvm';

const aggregatedSignaturePrefix = 0xff01;
const empty = Buffer.from([0x00, 0x00]);

export const magic = Buffer.from([0x77, 0x77]);
export const maxEcodingInt = 0xffff;

export const TxVersion = 0x02;

export const OperatorSum = 0xfe;
export const OperatorCmp = 0xff;

export class Encoder {
  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  write(buf: Buffer) {
    this.buf = Buffer.concat([this.buf, buf]);
  }

  writeBytes(buf: Buffer) {
    const len = buf.byteLength;
    if (len > 65 * 21) {
      throw new Error(`bytes too long. max length is 21 * 65, current length is ${len}`);
    }

    this.writeInt(len);
    this.write(buf);
  }

  writeInt(i: number) {
    if (i > maxEcodingInt) {
      throw new Error('int overflow');
    }
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(i);
    this.write(buf);
  }

  writeUint64(i: bigint) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(i);
    this.write(buf);
  }

  writeUint16(i: number) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(i);
    this.write(buf);
  }

  writeInteger(i: number) {
    const b = getIntBytes(i);
    this.writeInt(b.length);
    this.write(Buffer.from(b));
  }

  writeSlice(str: Buffer) {
    const l = str.length;
    if (l > 128) throw new Error('slice too long');
    this.write(Buffer.from([l]));
    this.write(str);
  }

  writeUUID(id: string) {
    const uuid: any = parse(id);
    for (let i = 0; i < uuid.length; i++) this.write(Buffer.from([uuid[i]]));
  }

  encodeInput(i: Input) {
    this.write(Buffer.from(i.hash!, 'hex'));
    this.writeInt(i.index!);

    if (!i.genesis) i.genesis = '';
    this.writeInt(i.genesis.length);
    this.write(Buffer.from(i.genesis));
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
      this.writeInteger(d.amount);
    }
    const m = i.mint;
    if (typeof m === 'undefined') {
      this.write(empty);
    } else {
      this.write(magic);
      if (!m.group) m.group = '';
      this.writeInt(m.group.length);
      this.write(Buffer.from(m.group));

      this.writeUint64(m.batch);
      this.writeInteger(m.amount);
    }
  }

  encodeOutput(o: Output) {
    if (!o.type) o.type = 0;
    this.write(Buffer.from([0x00, o.type]));
    this.writeInteger(new BN(1e8).mul(new BN(o.amount!)).toNumber());
    this.writeInt(o.keys!.length);

    o.keys!.forEach(k => this.write(Buffer.from(k, 'hex')));

    this.write(Buffer.from(o.mask!, 'hex'));

    const s = Buffer.from(o.script!, 'hex');
    this.writeInt(s.byteLength);
    this.write(s);

    const w = o.withdrawal;
    if (typeof w === 'undefined') {
      this.write(empty);
    } else {
      // TODO... not check...
      this.write(magic);
      this.write(Buffer.from(w.chain, 'hex'));

      const asset = Buffer.from(w.asset);
      this.writeInt(asset.byteLength);
      this.write(asset);

      if (!w.address) w.address = '';

      const addr = Buffer.from(w.address);
      this.writeInt(addr.byteLength);
      this.write(addr);

      const tag = Buffer.from(w.tag);
      this.writeInt(tag.byteLength);
      this.write(tag);
    }
  }

  encodeAggregatedSignature(js: Aggregated) {
    this.writeInt(maxEcodingInt);
    this.writeInt(aggregatedSignaturePrefix);
    this.write(Buffer.from(js.signature, 'hex'));

    if (js.signers.length === 0) {
      this.write(Buffer.from([0x00]));
      this.writeInt(0);
      return;
    }

    js.signers.forEach((m, i) => {
      if (i > 0 && m <= js.signers[i - 1]) {
        throw new Error('signers not sorted');
      }
      if (m > maxEcodingInt) {
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
    // eslint-disable-next-line no-return-assign
    js.signers.forEach(m => (masks[(m / 8) | 0] ^= 1 << (m % 8 | 0)));
    this.write(Buffer.from([0x00]));
    this.writeInt(masks.length);
    this.write(masks);
  }

  encodeSignature(sm: { [key: number]: string }) {
    const ss = Object.keys(sm)
      .map((j, i) => ({ index: j, sig: sm[i] }))
      .sort((a, b) => Number(a.index) - Number(b.index));

    this.writeInt(ss.length);
    ss.forEach(s => {
      this.writeUint16(Number(s.index));
      this.write(Buffer.from(s.sig, 'hex'));
    });
  }
}

function getIntBytes(x: number) {
  const bytes = [];
  do {
    bytes.unshift(x & 255);
    x = (x / 2 ** 8) | 0;
  } while (x !== 0);
  return bytes;
}