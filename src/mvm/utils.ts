import { ethers } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import serialize from 'serialize-javascript';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import { ContractRequest } from './types';
import { GenerateExtraRequest } from './types/bridge';
import { MixinAssetID } from '../constant';
import { MVMMainnet, bridgeServerPrivateKey } from './constant';
import { base64RawURLEncode } from '../client/utils/base64';
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
  const paramStr = params.map(i => i.trim()).join(',');
  return ethers.utils.id(`${func}(${paramStr})`).slice(2, 10);
};

/**
 * Get extra for one contract, consists of
 * 1 contract address without '0x'
 * 2 contract input length
 * 3 contract input:
 *     top 8 characters(without '0x') of KECCAK256 hash for contract function name and function parameter types
 *       e.g., addLiquidity(address,uint256) with
 *     abi code(without '0x') of contract function arguments, if arguments exist
 */
const getSingleExtra = ({ address, method, types = [], values = [] }: ContractRequest) => {
  if (types.length !== values.length) return '';

  const addr = address.toLocaleLowerCase();
  const contractAddress = `${ addr.slice(0, 2) === '0x' ? addr.slice(2) : addr }` ;

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

/**  Get extra for multiple contracts calling, started with number of contracts to be called */
export const getExtra = (contracts: ContractRequest[]) => {
  if (contracts.length === 0) return '';
  let extra = Buffer.from([0, contracts.length]).toString('hex');

  for (let i = 0; i < contracts.length; i++) {
    const singleExtra = Buffer.from(getSingleExtra(contracts[i]));
    extra += singleExtra;
  }

  return `0x${extra}`;
};

/** Get extra when extra > 200 and save its hash to Storage Contract */
export const getExtraWithStorageKey = (key: string, process: string = MVMMainnet.Registry.PID, storage: string = MVMMainnet.Storage.Contract) =>
  `${process.replaceAll('-', '')}${storage.slice(2)}${key.slice(2)}`;

export const signEd25519Action = (action: GenerateExtraRequest, publicKey: string) => {
  const publicBuffer = Buffer.from(publicKey, 'hex');
  const privateBuffer = Buffer.from(bridgeServerPrivateKey, 'hex');
  const key = sharedKey(
    convertSecretKey(privateBuffer),
    convertPublicKey(publicBuffer)
  );

  const BLOCK_SIZE = 16;

  const data = Buffer.from(serialize(action), 'utf8');
  const buffer = forge.util.createBuffer(data.toString('binary'));
  const paddingLen = BLOCK_SIZE - (buffer.length() % BLOCK_SIZE);
  const paddings = [];
  for (let i = 0; i < paddingLen; i += 1) {
    paddings.push(paddingLen);
  }
  buffer.putBytes(Buffer.from(paddings).toString('binary'));
  const len = buffer.length() + BLOCK_SIZE;

  const iv = forge.random.getBytesSync(BLOCK_SIZE);
  const cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(key, 'raw'));
  cipher.start({ iv });
  cipher.update(buffer);
  cipher.finish();

  const pinBuff = forge.util.createBuffer();
  pinBuff.putBytes(iv);
  pinBuff.putBytes(cipher.output.getBytes());

  const res = publicBuffer.toString('hex') + Buffer.from(pinBuff.getBytes(len), 'binary').toString('hex');
  return keccak256(`0x${res}`);
};

/** Get extra for Bridge Contract */
export const getBridgeExtra = (
  action: GenerateExtraRequest,
  publicKey: string,
  process = MVMMainnet.Registry.PID,
  storage = MVMMainnet.Storage.Contract
) => {
  const actionStr = serialize(action);
  const actionHex = Buffer.from(actionStr).toString('hex');
  const actionHash = signEd25519Action(action, publicKey);
  return `0x${process.replaceAll('-', '')}${storage.toLowerCase().slice(2)}${actionHash.slice(2)}${actionHex}`;
};

export const parseValueForBridge = (assetId: string, amount: string) => {
  if (assetId === MixinAssetID) {
    return ethers.utils.parseEther(Number(amount).toFixed(8));
  }
  return Math.round(ethers.utils.parseUnits(amount, 8).toNumber());
};