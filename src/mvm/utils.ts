import {ethers} from 'ethers';
import {base64RawURLEncode} from 'client/utils/base64';
import Encoder from './encoder';

// const OperationPurposeUnknown = 0
const OperationPurposeGroupEvent = 1;
// const OperationPurposeAddProcess = 11
// const OperationPurposeCreditProcess = 12

export const buildMemo = (contract: string, memo: string, isDelegateCall: boolean) => {
  const op = isDelegateCall ? '01' : '00';
  const address = contract.toLowerCase().slice(2);
  return `${op}${address}${memo}`;
};

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

// Extra consists of
// 1 contract address without '0x'
// 2 top 8 characters(without '0x') of KECCAK256 hash for contract function name and function parameter types
//   e.g., addLiquidity(address,uint256)
// 3 abi code(without '0x') of contract function arguments, if arguments exist
export const getExtra = (contract: string, methodName: string, types: string[] = [], values: any[] = []) => {
  if (types.length !== values.length) return '';

  const contractAddress = contract.startsWith('0x') ? contract.slice(2) : contract;
  const methodId = getMethodIdByAbi(methodName, types);
  let extra = `${contractAddress}${methodId}`;

  if (values.length > 0) {
    const abiCoder = new ethers.utils.AbiCoder();
    extra += abiCoder.encode(types, values).slice(2);
  }

  return extra;
};