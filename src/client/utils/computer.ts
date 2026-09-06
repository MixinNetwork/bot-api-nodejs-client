import { parse } from 'uuid';
import BigNumber from 'bignumber.js';
import { base64RawURLEncode } from './base64';

export const MAX_SOLANA_TX_SIZE = 1232;

export const OperationTypeAddUser = 1;
export const OperationTypeSystemCall = 2;
export const OperationTypeUserDeposit = 3;

export const userIdToBytes = (uid: string) => {
  let x: BigNumber;
  try {
    x = BigNumber(uid);
  } catch {
    throw new Error(`invalid user id: ${uid}`);
  }
  if (!x.isInteger() || x.isNegative() || x.isGreaterThan(BigNumber(2).pow(64).minus(1))) {
    throw new Error(`invalid user id: ${uid}`);
  }
  const bytes = [];
  let i = x;
  do {
    bytes.unshift(i.mod(256).toNumber());
    i = i.dividedToIntegerBy(256);
  } while (!i.isZero());
  while (bytes.length < 8) {
    bytes.unshift(0);
  }
  return Buffer.from(bytes);
};

// bytes of Solana transaction: Buffer.from(tx.serialize())
export const checkSystemCallSize = (txBuf: Buffer) => txBuf.byteLength <= MAX_SOLANA_TX_SIZE;

export const buildSystemCallExtra = (uid: string, cid: string, skipPostProcess: boolean, fid?: string) => {
  const flag = skipPostProcess ? 1 : 0;
  const ib = userIdToBytes(uid);
  const cb = parse(cid);
  const data = [ib, cb, Buffer.from([flag])];
  if (fid) data.push(parse(fid));
  return Buffer.concat(data);
};

export const buildComputerExtra = (operation: number, extra: Buffer) => Buffer.concat([Buffer.from([operation]), extra]);

export const encodeMtgExtra = (app_id: string, extra: Buffer) => {
  const data = Buffer.concat([parse(app_id), extra]);
  return base64RawURLEncode(data);
};
