export class Decoder {
  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  read(offset: number) {
    this.buf = this.buf.subarray(offset);
  }

  readByte() {
    const value = this.buf.readUint8();
    this.read(1)
    return value;
  }

  readBytes() {
    const len = this.readByte();
    const value = this.buf.subarray(0, len).toString('hex');
    this.read(len);
    return value;
  }

  readUInt64() {
    const value = this.buf.readBigUInt64BE();
    this.read(8)
    return value;
  }

  readUUID() {
    const value = this.buf.subarray(0, 16);
    this.read(16)
    return value;
  }
}
