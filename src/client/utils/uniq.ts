import JsSHA from 'jssha';
import forge from 'node-forge';
// @ts-ignore
import * as blake3 from 'blake3';
import { stringify as uuidStringify, v4 as uuid } from 'uuid';
import { SHA3 } from 'sha3';

// TODO: maybe try https://www.npmjs.com/package/node-forge#sha256
/** Supporting multisig for tokens & collectibles */
export const hashMembers = (ids: string[]): string => {
  const key = ids.sort().join('');
  const sha = new JsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });
  sha.update(key);
  return sha.getHash('HEX');
};

/** Generate an unique conversation id for contact */
export const uniqueConversationID = (userID: string, recipientID: string): string => {
  const [minId, maxId] = [userID, recipientID].sort();
  const md5 = forge.md.md5.create();
  md5.update(minId);
  md5.update(maxId);
  const bytes = Buffer.from(md5.digest().bytes(), 'binary');

  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return uuidStringify(bytes);
};

export const newHash = (data: Buffer) => new SHA3(256).update(data).digest('hex');

export const sha512Hash = (data: Buffer) => forge.md.sha512.create().update(data.toString('binary')).digest().toHex();

export const blake3Hash = async (data: Buffer) => {
  await blake3.load();
  return blake3.hash(data);
};

export const getUuid = () => uuid();
