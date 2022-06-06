import ethers from 'ethers';
import Encoder from './encoder';
import { base64RawURLEncode } from '../client/utils/base64';

// const OperationPurposeUnknown = 0
const OperationPurposeGroupEvent = 1;
// const OperationPurposeAddProcess = 11
// const OperationPurposeCreditProcess = 12

// TODO: writeBytes twice why?
export const encodeMemo = (extra: string, process: string): string => {
  const enc = new Encoder(Buffer.from([]));
  enc.writeInt(OperationPurposeGroupEvent);
  enc.writeUUID(process);
  enc.writeBytes(Buffer.from([]));
  enc.writeBytes(Buffer.from([]));
  enc.writeBytes(Buffer.from(extra, 'hex'));
  return base64RawURLEncode(enc.buf);
};

export const getMethodIdByAbi = (func: string, params: string[]): string => {
  const paramStr =  params.map((i) => i.trim()).join(',');
  return ethers.utils.id(`${func}(${paramStr})`).slice(2, 10);
};
