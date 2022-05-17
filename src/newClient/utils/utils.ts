import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import LittleEndian from 'int64-buffer';
import serialize from 'serialize-javascript';
import { v4 as uuid } from 'uuid';
import JsSHA from 'jssha';
import Keystore from '../types/keystore';

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
      uid: keystore.user_id,
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

  /*eslint no-bitwise: "allow"*/
  static privateKeyToCurve25519(privateKey: Buffer) {
    const seed = privateKey.subarray(0, 32);
    const md = forge.md.sha512.create();
    md.update(seed.toString('binary'));
    const digestx = md.digest();
    const digest = Buffer.from(digestx.getBytes(), 'binary');

    digest[0] &= 248;
    digest[31] &= 127;
    digest[31] |= 64;
    return digest.subarray(0, 32);
  }

  static hexToBytes(hex: string) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  }

  static sharedEd25519Key(pinTokenRaw: string, privateKeyRaw: string) {
    const pinToken = Buffer.from(pinTokenRaw, 'base64');
    let privateKey = Buffer.from(privateKeyRaw, 'base64');
    privateKey = this.privateKeyToCurve25519(privateKey);

    return sharedKey(privateKey, pinToken);
  }

  static signEd25519PIN(pin: string, keystore: Keystore) {
    const blockSize = 16;
    let Uint64 = LittleEndian.Int64LE;

    const sharedkey = this.sharedEd25519Key(keystore.pin_token, keystore.private_key);

    const iterator = Buffer.from(new Uint64(Math.floor((new Date()).getTime() / 1000)).toBuffer());
    const time = Buffer.from(new Uint64(Math.floor((new Date()).getTime() / 1000)).toBuffer());

    const pinByte = forge.util.createBuffer(pin, 'utf8');

    const buffer = forge.util.createBuffer();
    buffer.putBytes(pinByte.toString());
    buffer.putBytes(time.toString('binary'));
    buffer.putBytes(iterator.toString('binary'));
    const paddingLen = blockSize - (buffer.length() % blockSize);
    for (let i = 0; i < paddingLen; i += 1) {
      buffer.putBytes(paddingLen.toString(16));
    }
    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher('AES-CBC', forge.util.binary.hex.encode(sharedkey));

    cipher.start({
      iv,
    });
    cipher.update(buffer);
    cipher.finish();

    const pinBuff = forge.util.createBuffer();
    pinBuff.putBytes(iv);
    pinBuff.putBytes(cipher.output.getBytes());

    const encryptedBytes = Buffer.from(pinBuff.getBytes(), 'binary');
    return forge.util.binary.base64.encode(encryptedBytes);
  }
}

export default Utils;
