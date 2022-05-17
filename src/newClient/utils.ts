// Utils is some helper methods for mixin api
class Utils {
  // base64RawURLEncode is the standard raw, unpadded base64 encoding
  // base64RawURLDecode is same as encode
  // like Golang version https://pkg.go.dev/encoding/base64#Encoding
  static base64RawURLEncode(buf: Buffer) {
    return buf.toString('base64').replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
  }

  static base64RawURLDecode(raw: string): Buffer {
    const data = raw.replaceAll('-', '+').replaceAll('_', '/');
    return Buffer.from(data, 'base64');
  }
}

export default Utils;
