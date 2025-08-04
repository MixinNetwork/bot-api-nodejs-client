// @ts-ignore
import { now as nanonow } from 'nano-seconds';
import { ed25519 } from '@noble/curves/ed25519';
import { cbc } from '@noble/ciphers/aes';
import { Uint64LE as Uint64 } from 'int64-buffer';
import type { Keystore, AppKeystore, NetworkUserKeystore } from '../types/keystore';
import { base64RawURLDecode, base64RawURLEncode } from './base64';
import { Encoder } from './encoder';
import { edwards25519 as ed, getRandomBytes } from './ed25519';
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
  let buffer = Buffer.concat([_pin, time, iterator]);

  const paddingLen = blockSize - (buffer.byteLength % blockSize);
  const paddings = [];
  for (let i = 0; i < paddingLen; i += 1) {
    paddings.push(paddingLen);
  }
  buffer = Buffer.concat([buffer, Buffer.from(paddings)]);

  const iv = getRandomBytes(16);
  const sharedKey = sharedEd25519Key(keystore);

  const stream = cbc(sharedKey, iv);
  const res = stream.encrypt(buffer);

  const pinBuff = Buffer.concat([iv, res]);
  const encryptedBytes = pinBuff.subarray(0, pinBuff.byteLength - blockSize);
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

export const getOwnershipTransferTipBody = (user_id: string) => {
  const msg = `TIP:APP:OWNERSHIP:TRANSFER:${user_id}`;
  return sha256Hash(Buffer.from(msg));
};

export const signTipBody = (pin: string, msg: Buffer) => {
  const signData = Buffer.from(ed25519.sign(msg, pin));
  return signData.toString('hex');
};
