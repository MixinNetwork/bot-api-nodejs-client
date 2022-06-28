import {ethers} from 'ethers';
import {ContractRequest} from './types';
import {base64RawURLEncode} from '../client/utils/base64';
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

// Get extra for one contract
// consists of
// 1 contract address without '0x'
// 2 contract input length
// 3 contract input:
//     top 8 characters(without '0x') of KECCAK256 hash for contract function name and function parameter types
//       e.g., addLiquidity(address,uint256) +
//     abi code(without '0x') of contract function arguments, if arguments exist
const getSingleExtra = ({ address, method, types = [], values = [] }: ContractRequest) => {
  if (types.length !== values.length) return '';

  const addr = address.toLocaleLowerCase();
  const contractAddress = `${ addr.startsWith('0x') ? addr.slice(2) : addr }` ;

  const methodId = getMethodIdByAbi(method, types);
  let contractInput = `${methodId}`;
  if (values.length > 0) {
    const abiCoder = new ethers.utils.AbiCoder();
    contractInput += abiCoder.encode(types, values).slice(2);
  }

  const inputLength = Buffer.from([0, contractInput.length / 2]).toString('hex');
  const extra = `${contractAddress}${inputLength}${contractInput}`;
  return extra;
};

// Get total extra for multiple contracts, started with number of contracts
export const getExtra = (contracts: ContractRequest[]) => {
  if (!contracts.length) return '';
  let extra = Buffer.from([0, contracts.length]).toString('hex');

  for (let i = 0; i < contracts.length; i++) {
    const singleExtra = Buffer.from(getSingleExtra(contracts[i]));
    extra += singleExtra;
  }

  return extra;
};