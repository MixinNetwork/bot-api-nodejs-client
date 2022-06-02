import axios from 'axios';
import { utils } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { v4 } from 'uuid';
import { InvokeCodeParams, ExtraGenerateParams, PaymentGenerateParams } from '../types';
import Encoder from './encoder';
import { MVMMainnet } from './constant';
import { RawTransactionRequest, PaymentRequestResponse, base64RawURLEncode } from '../client';

// const OperationPurposeUnknown = 0
const OperationPurposeGroupEvent = 1;
// const OperationPurposeAddProcess = 11
// const OperationPurposeCreditProcess = 12

const receivers = ['a15e0b6d-76ed-4443-b83f-ade9eca2681a', 'b9126674-b07d-49b6-bf4f-48d965b2242b', '15141fe4-1cfd-40f8-9819-71e453054639', '3e72ca0c-1bab-49ad-aa0a-4d8471d375e7'];
const mvmClient = axios.create({
  baseURL: 'https://mvm-api.test.mixinbots.com',
});

const threshold = 3;
const MVMApiURI = 'https://mvm-api.test.mixinbots.com';

// todo error handle
export const MVMApiClient = axios.create({
  baseURL: MVMApiURI,
});

// 获取 mvm 的交易输入
export const getMvmTransaction = (params: InvokeCodeParams): RawTransactionRequest => ({
  asset_id: params.asset,
  amount: params.amount,
  trace_id: params.trace || v4(),
  opponent_multisig: { receivers, threshold },
  memo: encodeMemo(params.extra, params.process || MVMMainnet.Registry.PID),
});

// 根据 abi 获取 extra
export const abiParamsGenerator = (contractAddress: string, abi: JsonFragment[]): { [method: string]: Function } => {
  const res: { [method: string]: Function } = {};
  if (contractAddress.startsWith('0x')) contractAddress = contractAddress.slice(2);
  abi.forEach(item => {
    if (item.type === 'function') {
      const types = item.inputs?.map(v => v.type!) || [];
      const methodID = getMethodIdByAbi(item.name!, types);
      res[item.name!] = (...args: any[]): ExtraGenerateParams => {
        const values = Array.from(args);
        const options = values.length === types.length + 1 ? values.pop() : {};
        return { contractAddress, methodID, types, values, options };
      };
    }
  });
  return res;
};

// 根据调用信息获取 extra
export const extraGenerateByInfo = async (params: ExtraGenerateParams): Promise<string> => {
  let { contractAddress, methodID } = params;
  const { methodName, types = [], values = [], options = {} } = params;
  const { uploadkey, delegatecall, ignoreUpload, process = MVMMainnet.Registry.PID, address = MVMMainnet.Registry.Address} = options;

  if (!contractAddress) return Promise.reject(new Error('contractAddress is required'));
  if (contractAddress.startsWith('0x')) contractAddress = contractAddress.slice(2);
  if (!methodID && !methodName) return Promise.reject(new Error('methodID or methodName is required'));
  if (!methodID) methodID = getMethodIdByAbi(methodName!, types);
  if (types.length !== values.length) return Promise.reject(new Error('error: types.length!=values.length'));

  let extra = contractAddress + methodID;

  if (types.length !== 0) {
    const abiCoder = new utils.AbiCoder();
    extra += abiCoder.encode(types, values).slice(2);
  }
  if (ignoreUpload) return extra;

  let opcode: number = 0;
  if (encodeMemo(extra, process).length > 200) {
    if (!uploadkey) return Promise.reject(new Error('please provide key to generate extra(length > 200)'));
    const raw = `0x${ extra }`;
    const key = utils.keccak256(raw);
    const res = await mvmClient.post(`/`, { uploadkey, key, raw, address });
    if (!res.data.hash) return Promise.reject(res);
    opcode += 1;
    extra = key.slice(2);
  }
  if (delegatecall) opcode += 2;

  return (`0${ opcode }${ extra }`).toLowerCase();
};

export const paymentGenerateByInfo = async (params: PaymentGenerateParams): Promise<PaymentRequestResponse | RawTransactionRequest> => {
  if (!params.options) params.options = {};
  params.options.ignoreUpload = true;
  const extra = await extraGenerateByInfo(params);
  const { type, trace, asset, amount } = params.payment || {};
  const { process, delegatecall, uploadkey, address } = params.options;
  const res = await mvmClient.post('/payment', {
    extra,
    process,
    delegatecall,
    uploadkey,
    address,
    type,
    trace,
    asset,
    amount,
  });
  return res.data;
};


const getMethodIdByAbi = (methodName: string, types: string[]): string => utils.id(`${ methodName }(${ types.join(',') })`).slice(2, 10);

const encodeMemo = (extra: string, process: string): string => {
  const enc = new Encoder(Buffer.from([]));
  enc.writeInt(OperationPurposeGroupEvent);
  enc.writeUUID(process);
  enc.writeBytes(Buffer.from([]));
  enc.writeBytes(Buffer.from([]));
  enc.writeBytes(Buffer.from(extra, 'hex'));
  return base64RawURLEncode(enc.buf);
};
