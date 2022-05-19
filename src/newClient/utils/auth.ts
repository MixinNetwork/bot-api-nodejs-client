import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import LittleEndian from 'int64-buffer';
import serialize from 'serialize-javascript';
import { v4 as uuid } from 'uuid';
import Keystore from '../types/keystore';
import Base64 from './base64';

class Auth {
  static privateKeyToCurve25519(privateKey: Buffer) {
    const seed = privateKey.subarray(0, 32);
    const md = forge.md.sha512.create();
    md.update(seed.toString('binary'));
    const digest = Buffer.from(md.digest().getBytes(), 'binary');

    digest[0] &= 248;
    digest[31] &= 127;
    digest[31] |= 64;
    return digest.subarray(0, 32);
  }

  static sharedEd25519Key(pinTokenRaw: string, privateKeyRaw: string) {
    const pinToken = Buffer.from(pinTokenRaw, 'base64');
    let privateKey = Buffer.from(privateKeyRaw, 'base64');
    privateKey = this.privateKeyToCurve25519(privateKey);

    return sharedKey(privateKey, pinToken);
  }

  static signEd25519PIN(pin: string, keystore: Keystore) {
    const blockSize = 16;
    const Uint64 = LittleEndian.Int64LE;

    const sharedKey = this.sharedEd25519Key(keystore.pin_token, keystore.private_key);

    const iterator = Buffer.from(new Uint64(Math.floor(new Date().getTime() / 1000)).toBuffer());
    const time = Buffer.from(new Uint64(Math.floor(new Date().getTime() / 1000)).toBuffer());

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
    const cipher = forge.cipher.createCipher('AES-CBC', forge.util.binary.hex.encode(sharedKey));

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

    const header = Base64.RawURLEncode(serialize({ alg: 'EdDSA', typ: 'JWT' }));
    const payloadStr = Base64.RawURLEncode(serialize(payload));

    const privateKey = Base64.RawURLDecode(keystore.private_key);
    const result = [header, payloadStr];
    const signData = forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey,
    });

    const sign = Base64.RawURLEncode(Buffer.from(signData));
    result.push(sign);
    return result.join('.');
  }
}

export default Auth;
