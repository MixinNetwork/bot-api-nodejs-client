import axios from 'axios';
import { ethers, utils, BigNumber } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { v4 as newUUID, parse, stringify } from 'uuid';
import { RawTransactionRequest, PaymentRequestResponse } from '../newClient';
import { InvokeCodeParams, ExtraGenerateParams, PaymentGenerateParams } from '../types';
import { Blank } from './registry';
import { Encoder } from '../mixin/encoder';
import { base64url } from '../mixin/sign';
import { registryAbi, registryAddress, registryProcess } from '../mixin/mvm_registry';

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
  trace_id: params.trace || newUUID(),
  opponent_multisig: { receivers, threshold },
  memo: encodeMemo(params.extra, params.process || registryProcess),
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
  const { uploadkey, delegatecall, ignoreUpload, process = registryProcess, address = registryAddress } = options;

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

export const getContractByAssetID = (id: string, processAddress = registryAddress): Promise<string> =>
  getRegistryContract(processAddress).contracts(`0x${ Buffer.from(parse(id) as Buffer).toString('hex') }`);

export const getContractByUserIDs = (ids: string | string[], threshold?: number, processAddress = registryAddress): Promise<string> => {
  if (typeof ids === 'string') ids = [ids];
  if (!threshold) threshold = ids.length;
  const encoder = new Encoder(Buffer.from([]));
  encoder.writeInt(ids.length);
  ids.forEach(id => encoder.writeUUID(id));
  encoder.writeInt(threshold);
  return getRegistryContract(processAddress).contracts(utils.keccak256(`0x${encoder.buf.toString('hex')}`));
};

export const getAssetIDByAddress = async (contract_address: string, processAddress = registryAddress): Promise<string> => {
  const registry = getRegistryContract(processAddress);
  let res = await registry.assets(contract_address);

  if (res instanceof BigNumber) res = res._hex;
  if (res.length !== 34) return '';

  res = res.slice(2);
  return stringify(Buffer.from(res, 'hex'));
};

export const getUserIDByAddress = async (contract_address: string, processAddress = registryAddress): Promise<string> => {
  const registry = getRegistryContract(processAddress);
  let res = await registry.users(contract_address);

  if (res instanceof BigNumber) res = res._hex;
  if (res.length === 42) {
    res = res.slice(6);
    res = res.slice(0, 32);
    return stringify(Buffer.from(res, 'hex'));
  }

  return res;
};

export const getUserAddressByID = async (userId: string, processAddress = registryAddress) => {
  const identity = `0x0001${userId}0001`;
  const hash = ethers.utils.keccak256(identity.replaceAll('-', ''));
  const address = await getRegistryContract(processAddress).contracts(hash);
  if (address === Blank) return '';
  return address;
};

export const getAssetAddressByID = async (assetId: string, processAddress = registryAddress) => {
  const address = await getRegistryContract(processAddress).contracts(assetId);
  if (!address) return '';
  return address;
};

const getRegistryContract = (address = registryAddress) => new ethers.Contract(address, registryAbi, new ethers.providers.JsonRpcProvider('https://quorum-testnet.mixin.zone/'));

const getMethodIdByAbi = (methodName: string, types: string[]): string => utils.id(`${ methodName }(${ types.join(',') })`).slice(2, 10);

const encodeMemo = (extra: string, process: string): string => {
  const enc = new Encoder(Buffer.from([]));
  enc.writeInt(OperationPurposeGroupEvent);
  enc.writeUUID(process);
  enc.writeBytes(Buffer.from([]));
  enc.writeBytes(Buffer.from([]));
  enc.writeBytes(Buffer.from(extra, 'hex'));
  return base64url(enc.buf);
};
