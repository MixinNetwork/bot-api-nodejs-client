import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import LittleEndian from 'int64-buffer';
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
  const Uint64 = LittleEndian.Int64LE;

  const sharedKey = sharedEd25519Key(keystore.pin_token!, keystore.private_key!);

  const iterator = Buffer.from(new Uint64(Math.floor(new Date().getTime() / 1000)).toBuffer());
  const time = Buffer.from(new Uint64(Math.floor(new Date().getTime() / 1000)).toBuffer());

  const pinByte = forge.util.createBuffer(pin, 'utf8');

  const buffer = forge.util.createBuffer();
  buffer.putBytes(pinByte.toString());
  buffer.putBytes(time.toString('binary'));
  buffer.putBytes(iterator.toString('binary'));
  const paddingLen = blockSize - (buffer.length() % blockSize);
  const paddings = [];
  for (let i = 0; i < paddingLen; i += 1) {
    paddings.push(paddingLen);
  }
  buffer.putBytes(Buffer.from(paddings).toString('binary'));
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher('AES-CBC', forge.util.hexToBytes(forge.util.binary.hex.encode(sharedKey)));

  cipher.start({
    iv,
  });
  cipher.update(buffer);
  cipher.finish();

  const pinBuff = forge.util.createBuffer();
  pinBuff.putBytes(iv);
  pinBuff.putBytes(cipher.output.getBytes());

  const encryptedBytes = Buffer.from(pinBuff.getBytes(), 'binary');
  return base64RawURLEncode(encryptedBytes);
};