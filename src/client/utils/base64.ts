/**
 * mixin uses raw url encoding as default for base64 process
 * base64RawURLEncode is the standard raw, unpadded base64 encoding
 * base64RawURLDecode is same as encode
 * like Golang version https://pkg.go.dev/encoding/base64#Encoding
 */
export const base64RawURLEncode = (raw: Buffer | Uint8Array | string): string => {
  let buf = raw;
  if (typeof raw === 'string') {
    buf = Buffer.from(raw);
  } else if (raw instanceof Uint8Array) {
    buf = Buffer.from(raw);
  }
  if (buf.length === 0) {
    return '';
  }
  return buf.toString('base64').replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
};

export const base64RawURLDecode = (raw: string | Buffer): Buffer => {
  let data = raw instanceof Buffer ? raw.toString() : raw;
  data = data.replaceAll('-', '+').replaceAll('_', '/');
  return Buffer.from(data, 'base64');
};
