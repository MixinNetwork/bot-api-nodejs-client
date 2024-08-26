// @ts-ignore
import { now as nanonow } from 'nano-seconds';
import { util, random, cipher, pki } from 'node-forge';
import { Uint64LE as Uint64 } from 'int64-buffer';
import type { Keystore, AppKeystore, NetworkUserKeystore } from '../types/keystore';
import { base64RawURLDecode, base64RawURLEncode } from './base64';
import { Encoder } from './encoder';
import { edwards25519 as ed } from './ed25519';
import { sha256Hash } from './uniq';

export const getNanoTime = () => {
  const now: number[] = nanonow();
  return now[0] * 1e9 + now[1];
};

export const sharedEd25519Key = (keystore: AppKeystore | NetworkUserKeystore) => {
  const pub = 'server_public_key' in keystore ? ed.edwardsToMontgomery(Buffer.from(keystore.server_public_key, 'hex')) : base64RawURLDecode(keystore.pin_token_base64);
  const pri = ed.edwardsToMontgomeryPriv(Buffer.from(keystore.session_private_key, 'hex'));
  return ed.x25519.getSharedSecret(pri, pub);
};

export const getTipPinUpdateMsg = (pub: Buffer, counter: number) => {
  const enc = new Encoder(pub);
  enc.writeUint64(BigInt(counter));
  return enc.buf;
};

export const signEd25519PIN = (pin: string, keystore: Keystore | undefined): string => {
  if (!keystore || !keystore.session_private_key) return '';
  if (!('server_public_key' in keystore) && !('pin_token_base64' in keystore)) return '';
  const blockSize = 16;

  const _pin = Buffer.from(pin, 'hex');
  const iterator = Buffer.from(new Uint64(getNanoTime()).toBuffer());
  const time = Buffer.from(new Uint64(Date.now() / 1000).toBuffer());
  const buf = Buffer.concat([_pin, time, iterator]);

  const buffer = util.createBuffer(buf.toString('binary'));
  const paddingLen = blockSize - (buffer.length() % blockSize);
  const paddings = [];
  for (let i = 0; i < paddingLen; i += 1) {
    paddings.push(paddingLen);
  }
  buffer.putBytes(Buffer.from(paddings).toString('binary'));

  const iv = random.getBytesSync(blockSize);
  const sharedKey = sharedEd25519Key(keystore);
  const cp = cipher.createCipher('AES-CBC', util.createBuffer(sharedKey, 'raw'));
  cp.start({ iv });
  cp.update(buffer);
  cp.finish();

  const pinBuff = util.createBuffer();
  pinBuff.putBytes(iv);
  pinBuff.putBytes(cp.output.getBytes());

  const len = pinBuff.length();
  const encryptedBytes = Buffer.from(pinBuff.getBytes(len - 16), 'binary');
  return base64RawURLEncode(encryptedBytes);
};

export const getCreateAddressTipBody = (asset_id: string, publicKey: string, tag: string, name: string) => {
  const msg = `TIP:ADDRESS:ADD:${asset_id + publicKey + tag + name}`;
  return sha256Hash(Buffer.from(msg));
};

export const getRemoveAddressTipBody = (address_id: string) => {
  const msg = `TIP:ADDRESS:REMOVE:${address_id}`;
  return sha256Hash(Buffer.from(msg));
};

export const getVerifyPinTipBody = (timestamp: number) => {
  const msg = `TIP:VERIFY:${`${timestamp}`.padStart(32, '0')}`;
  return Buffer.from(msg);
};

export const signTipBody = (pin: string, msg: Buffer) => {
  const privateKey = Buffer.from(pin, 'hex');
  const signData = pki.ed25519.sign({
    message: msg,
    privateKey,
  });
  return signData.toString('hex');
};
