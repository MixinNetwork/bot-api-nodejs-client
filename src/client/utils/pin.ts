import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import { Uint64LE as Uint64 } from 'int64-buffer';
import Keystore from '../types/keystore';
import { base64RawURLEncode } from './base64';

const privateKeyToCurve25519 = (privateKey: Buffer) => {
  const seed = privateKey.subarray(0, 32);
  const md = forge.md.sha512.create();
  md.update(seed.toString('binary'));
  const digest = Buffer.from(md.digest().getBytes(), 'binary');

  digest[0] &= 248;
  digest[31] &= 127;
  digest[31] |= 64;
  return digest.subarray(0, 32);
};

export const sharedEd25519Key = (pinTokenRaw: string, privateKeyRaw: string) => {
  const pinToken = Buffer.from(pinTokenRaw, 'base64');
  let privateKey = Buffer.from(privateKeyRaw, 'base64');
  privateKey = privateKeyToCurve25519(privateKey);

  return sharedKey(privateKey, pinToken);
};

export const signEd25519PIN = (pin: string, keystore: Keystore | undefined): string => {
  if (!keystore) {
    return '';
  }
  const blockSize = 16;

  const _pin = Buffer.from(pin, 'utf8');
  const iterator = Buffer.from(new Uint64(Math.floor(Date.now() / 1000)).toBuffer());
  const time = Buffer.from(new Uint64(Math.floor(Date.now() / 1000)).toBuffer());
  const buf = Buffer.concat([_pin, time, iterator]);

  const buffer = forge.util.createBuffer(buf.toString('binary'));
  const paddingLen = blockSize - (buffer.length() % blockSize);
  const paddings = [];
  for (let i = 0; i < paddingLen; i += 1) {
    paddings.push(paddingLen);
  }
  buffer.putBytes(Buffer.from(paddings).toString('binary'));

  const iv = forge.random.getBytesSync(16);
  const sharedKey = sharedEd25519Key(keystore.pin_token!, keystore.private_key!);
  const cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(sharedKey, 'raw'));
  cipher.start({ iv });
  cipher.update(buffer);
  cipher.finish();

  const pinBuff = forge.util.createBuffer();
  pinBuff.putBytes(iv);
  pinBuff.putBytes(cipher.output.getBytes());

  const encryptedBytes = Buffer.from(pinBuff.getBytes().slice(0, 48), 'binary');
  return base64RawURLEncode(encryptedBytes);
};