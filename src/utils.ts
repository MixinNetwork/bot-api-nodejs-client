import { createHash } from 'crypto';

export const uniqueConversationID = (userID: string, recipientID: string) => {
  let [minId, maxId] = [userID, recipientID];
  if (minId > maxId) {
    [minId, maxId] = [recipientID, userID];
  }

  const hash = createHash('md5');
  hash.update(minId);
  hash.update(maxId);
  const bytes = hash.digest();

  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const digest = Array.from(bytes, byte => `0${(byte & 0xff).toString(16)}`.slice(-2)).join('');
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`;
};
