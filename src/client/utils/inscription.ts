import { v4 } from 'uuid';
import type {
  GhostKey,
  InscriptionDeploy,
  InscriptionDistribute,
  InscriptionInscribe,
  InscriptionOccupy,
  InscriptionOperation,
  SafeOutputsRequest,
  SafeTransactionRecipient,
  SafeUtxoOutput,
  SequencerTransactionRequest,
  TransactionRequest,
} from '../types';
import { buildSafeTransaction, buildSafeTransactionRecipient, encodeSafeTransaction, signSafeTransaction } from './safe';

export const InscriptionModeInstant = 1;
export const InscriptionModeDone = 2;

export interface InscriptionUtxoClient {
  safeOutputs: (params: SafeOutputsRequest) => Promise<SafeUtxoOutput[]>;
  ghostKey: (recipients: SafeTransactionRecipient[], trace: string, spendPrivateKey: string) => Promise<(GhostKey | undefined)[]>;
  verifyTransaction: (params: TransactionRequest[]) => Promise<SequencerTransactionRequest[]>;
  sendTransactions: (params: TransactionRequest[]) => Promise<SequencerTransactionRequest[]>;
}

export const buildInscriptionOperationExtra = (operation: InscriptionOperation): Buffer => Buffer.from(JSON.stringify(operation), 'utf8');

export const decodeInscriptionOperationExtra = (extra: Buffer | string): InscriptionOperation => {
  const data = typeof extra === 'string' ? Buffer.from(extra, 'hex') : extra;
  let operation: unknown;
  try {
    operation = JSON.parse(data.toString('utf8'));
  } catch {
    throw new Error('invalid inscription operation extra');
  }
  if (!operation || typeof operation !== 'object') throw new Error('invalid inscription operation extra');

  const op = operation as Record<string, unknown>;
  if (op.operation === 'inscribe' && typeof op.recipient === 'string') return operation as InscriptionInscribe;
  if (op.distribute === 'distribute' && Number.isInteger(op.sequence)) return operation as InscriptionDistribute;
  if (op.operation === 'occupy' && Number.isInteger(op.sequence)) return operation as InscriptionOccupy;
  if (op.version === 1 && (op.mode === InscriptionModeInstant || op.mode === InscriptionModeDone)) return operation as InscriptionDeploy;
  throw new Error('unknown inscription operation');
};

export interface InscriptionOutputRequest {
  members?: string[];
  threshold?: number;
  limit?: number;
}

export const getInscriptionOutput = async (utxo: InscriptionUtxoClient, inscriptionHash: string, request: InscriptionOutputRequest = {}): Promise<SafeUtxoOutput> => {
  const { members, threshold, limit = 500 } = request;

  let offset: number | undefined;
  for (;;) {
    const outputs = await utxo.safeOutputs({
      members,
      threshold,
      state: 'unspent',
      offset,
      limit,
    });

    const found = outputs.find(o => o.inscription_hash === inscriptionHash);
    if (found) return found;

    if (outputs.length < limit) break;
    offset = outputs[outputs.length - 1].sequence;
  }

  throw new Error(`unspent inscription output not found: ${inscriptionHash}`);
};

export interface TransferInscriptionParams {
  inscriptionHash?: string;
  utxo?: SafeUtxoOutput;
  receivers: string[];
  threshold: number;
  spendPrivateKey: string;
  memo?: string;
  signerIndex?: number;
  request_id?: string;
  members?: string[];
  ownershipThreshold?: number;
}

export type SafeTransferInscriptionRequest = Omit<TransferInscriptionParams, 'spendPrivateKey'> & {
  /** defaults to the spend_private_key in the keystore */
  spendPrivateKey?: string;
};

/**
 * Transfer an inscription to a recipient by spending the inscription output
 * entirely: inscriptions can't be split or merged, and no change is allowed.
 */
export const transferInscription = async (utxo: InscriptionUtxoClient, params: TransferInscriptionParams): Promise<SequencerTransactionRequest[]> => {
  let utxoOutput = params.utxo;
  if (!utxoOutput) {
    if (!params.inscriptionHash) throw new Error('either utxo or inscriptionHash is required to transfer an inscription');
    utxoOutput = await getInscriptionOutput(utxo, params.inscriptionHash, {
      members: params.members,
      threshold: params.ownershipThreshold,
    });
  }

  if (!utxoOutput.inscription_hash) throw new Error('the output does not carry an inscription');
  if (params.inscriptionHash && utxoOutput.inscription_hash !== params.inscriptionHash) throw new Error('inscription hash mismatch');
  if (utxoOutput.state !== 'unspent') throw new Error(`the inscription output is ${utxoOutput.state}`);

  const request_id = params.request_id ?? v4();
  const extra = params.memo ? Buffer.from(params.memo, 'utf8') : Buffer.alloc(0);
  const recipients = [buildSafeTransactionRecipient(params.receivers, params.threshold, utxoOutput.amount)];

  const ghosts = await utxo.ghostKey(recipients, request_id, params.spendPrivateKey);
  const tx = buildSafeTransaction([utxoOutput], recipients, ghosts, extra);
  const raw = encodeSafeTransaction(tx);

  const verified = await utxo.verifyTransaction([{ raw, request_id }]);
  if (!verified[0]?.views || verified[0].views.length < tx.inputs.length) throw new Error('invalid views to sign the inscription transaction');

  const signedRaw = signSafeTransaction(tx, verified[0].views, params.spendPrivateKey, params.signerIndex ?? 0);
  return utxo.sendTransactions([{ raw: signedRaw, request_id }]);
};
