import forge from 'node-forge';
import { v4 as uuid } from 'uuid';
import serialize from 'serialize-javascript';
import JsSHA from 'jssha';
import { Keystore } from 'types';

// Utils is some helper methods for mixin api
class Utils {
  // base64RawURLEncode is the standard raw, unpadded base64 encoding
  // base64RawURLDecode is same as encode
  // like Golang version https://pkg.go.dev/encoding/base64#Encoding
  static base64RawURLEncode(raw: Buffer | string): string {
    let buf = raw;
    if (typeof raw === 'string') {
      buf = Buffer.from(raw);
    }
    if (buf.length === 0) {
      return '';
    }
    return buf.toString('base64').replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
  }

  static base64RawURLDecode(raw: string | Buffer): Buffer {
    let data = raw instanceof Buffer ? raw.toString() : raw;
    data = data.replaceAll('-', '+').replaceAll('_', '/');
    return Buffer.from(data, 'base64');
  }

  static signAuthenticationToken(requestMethod: string, uri: string, params: Object | string, keystore: Keystore) {
    const method = requestMethod.toLocaleUpperCase();
    let data: string = '';
    if (typeof params === 'object') {
      data = serialize(params);
    } else if (typeof params === 'string') {
      data = params;
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const md = forge.md.sha256.create();
    md.update(method + uri + data, 'utf8');

    const payload = {
      uid: keystore.client_id,
      sid: keystore.session_id,
      iat,
      exp,
      jti: uuid(),
      sig: md.digest().toHex(),
      scp: keystore.scope || 'FULL',
    };

    const header = this.base64RawURLEncode(serialize({ alg: 'EdDSA', typ: 'JWT' }));
    const payloadStr = this.base64RawURLEncode(serialize(payload));

    const privateKey = this.base64RawURLDecode(keystore.private_key);
    const result = [header, payloadStr];
    const signData = forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey,
    });

    const sign = this.base64RawURLEncode(Buffer.from(signData));
    result.push(sign);
    return result.join('.');
  }

  static hashMembers(ids: string[]): string {
    const key = ids.sort().join('');
    const sha = new JsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });
    sha.update(key);
    return sha.getHash('HEX');
  }
}

export default Utils;
