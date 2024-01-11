// @ts-ignore
import nano from 'nano-seconds';
import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import { Uint64LE as Uint64 } from 'int64-buffer';
import Keystore from '../types/keystore';
import { base64RawURLEncode } from './base64';
import { Encoder } from '../../mvm';
import { edwards25519 as ed } from './ed25519';

export const getNanoTime = () => {
  const now: number[] = nano.now();
  return now[0] * 1e9 + now[1];
};

export const sharedEd25519Key = (server_public_key: string, session_private_key: string) => {
  const pub = ed.edwardsToMontgomery(Buffer.from(server_public_key, 'hex'));
  const pri = ed.edwardsToMontgomeryPriv(Buffer.from(session_private_key, 'hex'));
  return sharedKey(pri, pub);
};

export const getTipPinUpdateMsg = (pub: Buffer, counter: number) => {
  const enc = new Encoder(pub);
  enc.writeUint64(BigInt(counter));
  return enc.buf;
};

export const signEd25519PIN = (pin: string, keystore: Keystore | undefined): string => {
  if (!keystore || !keystore.session_private_key || !('server_public_key' in keystore)) {
    return '';
  }
  const blockSize = 16;

  const _pin = Buffer.from(pin, 'hex');
  const iterator = Buffer.from(new Uint64(getNanoTime()).toBuffer());
  const time = Buffer.from(new Uint64(Date.now() / 1000).toBuffer());
  const buf = Buffer.concat([_pin, time, iterator]);

  const buffer = forge.util.createBuffer(buf.toString('binary'));
  const paddingLen = blockSize - (buffer.length() % blockSize);
  const paddings = [];
  for (let i = 0; i < paddingLen; i += 1) {
    paddings.push(paddingLen);
  }
  buffer.putBytes(Buffer.from(paddings).toString('binary'));

  const iv = forge.random.getBytesSync(blockSize);
  const sharedKey = sharedEd25519Key(keystore.server_public_key, keystore.session_private_key);
  const cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(sharedKey, 'raw'));
  cipher.start({ iv });
  cipher.update(buffer);
  cipher.finish();

  const pinBuff = forge.util.createBuffer();
  pinBuff.putBytes(iv);
  pinBuff.putBytes(cipher.output.getBytes());

  const len = pinBuff.length();
  const encryptedBytes = Buffer.from(pinBuff.getBytes(len - 16), 'binary');
  return base64RawURLEncode(encryptedBytes);
};

export const buildTipPin = (pin: string) => {
  const timestamp = getNanoTime();
  const msg = `TIP:VERIFY:${`${timestamp}`.padStart(32, '0')}`;
  const privateKey = Buffer.from(pin, 'hex');
  const signData = forge.pki.ed25519.sign({
    message: msg,
    encoding: 'utf8',
    privateKey,
  });
  return {
    pin_base64: signData.toString('hex'),
    timestamp,
  };
};
