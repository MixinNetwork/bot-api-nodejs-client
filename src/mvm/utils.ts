import { ethers } from 'ethers';
import serialize from 'serialize-javascript';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { sharedKey } from 'curve25519-js';
import forge from 'node-forge';
import { ContractRequest } from './types';
import { GenerateExtraRequest } from './types/bridge';
import Encoder from './encoder';
import { MixinAssetID } from '../constant';
import { bridgeServerPublicKey, MVMMainnet } from './constant';
import { getED25519KeyPair, base64RawURLDecode, base64RawURLEncode } from '../client';

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

/** Get new extra when extra > 200, and it has been written to Storage Contract */
export const getExtraWithStorageKey = (key: string, process: string = MVMMainnet.Registry.PID, storage: string = MVMMainnet.Storage.Contract) =>
  `${process.replaceAll('-', '')}${storage.slice(2)}${key.slice(2)}`;

export const signEd25519Action = (
  action: GenerateExtraRequest,
  clientPrivateKey: string,
  serverPublicKey: string,
) => {
  const privateBuffer = convertSecretKey(base64RawURLDecode(clientPrivateKey));
  const publicBuffer = convertPublicKey(Buffer.from(serverPublicKey, 'hex'));
  const key = sharedKey(privateBuffer, publicBuffer);

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

  return Buffer.from(pinBuff.getBytes(len), 'binary').toString('hex');
};

/**
 * Get extra for Bridge Contract
 * * action is encrypted by the shared key of the privateKey of client and publicKey of server
 * * Bridge Extra is the publicKey of client + encrypted action
 * Considering the privacy protection, extra for Bridge MUST write to Storage Contract with its keccak256 hash and itself
 * Then the new extra would be Registry PID + Storage Contract Address + keccak256 hash of Bridge Extra (getExtraWithStorageKey)
 * */
export const getBridgeExtra = (action: GenerateExtraRequest, serverPublicKey = bridgeServerPublicKey) => {
  const keyPair = getED25519KeyPair();
  const encryptedAction = signEd25519Action(action, keyPair.privateKey, serverPublicKey);
  const publicKeyHex = base64RawURLDecode(keyPair.publicKey).toString('hex');
  return `0x${publicKeyHex}${encryptedAction}`;
};

export const parseValueForBridge = (assetId: string, amount: string) => {
  if (assetId === MixinAssetID) {
    return ethers.utils.parseEther(Number(amount).toFixed(8));
  }
  return Math.round(ethers.utils.parseUnits(amount, 8).toNumber());
};