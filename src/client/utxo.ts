import type { AxiosInstance } from 'axios';
import type {
  GhostKey,
  GhostKeyRequest,
  OutputFetchRequest,
  OutputsRequest,
  SafeOutputsRequest,
  SafeBalanceRequest,
  SafeUtxoOutput,
  TransactionRequest,
  SequencerTransactionRequest,
  UtxoOutput,
  SafeTransactionRecipient,
} from './types';
import { blake3Hash, buildClient, deriveGhostPublicKey, getPublicFromMainnetAddress, getTotalBalanceFromOutputs, hashMembers, integerToBytes, uniqueConversationID } from './utils';
import { edwards25519 as ed, newKeyFromSeed } from './utils/ed25519';

export const UtxoKeystoreClient = (axiosInstance: AxiosInstance) => ({
  outputs: (params: OutputsRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),

  /**
   * Utxos of current user will be returned, if members and threshold are not provided.
   */
  safeOutputs: (params: SafeOutputsRequest): Promise<SafeUtxoOutput[]> =>
    axiosInstance.get<unknown, SafeUtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: params.members ? hashMembers(params.members) : undefined,
      },
    }),

  safeAssetBalance: async (params: SafeBalanceRequest) => {
    const outputs = await axiosInstance.get<unknown, SafeUtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: params.members ? hashMembers(params.members) : undefined,
        state: 'unspent',
      },
    });
    return getTotalBalanceFromOutputs(outputs).toString();
  },

  fetchSafeOutputs: (params: OutputFetchRequest): Promise<UtxoOutput[]> => axiosInstance.post<unknown, UtxoOutput[]>('/safe/outputs/fetch', params),

  fetchTransaction: (transactionId: string): Promise<SequencerTransactionRequest> => axiosInstance.get<unknown, SequencerTransactionRequest>(`/safe/transactions/${transactionId}`),

  verifyTransaction: (params: TransactionRequest[]): Promise<SequencerTransactionRequest[]> =>
    axiosInstance.post<unknown, SequencerTransactionRequest[]>('/safe/transaction/requests', params),

  sendTransactions: (params: TransactionRequest[]): Promise<SequencerTransactionRequest[]> =>
    axiosInstance.post<unknown, SequencerTransactionRequest[]>('/safe/transactions', params),

  /**
   * Get one-time information to transfer assets to single user or multisigs group, not required for Mixin Kernel Address
   * index in GhostKeyRequest MUST be the same with the index of corresponding output
   * receivers will be sorted in the function
   */
  ghostKey: async (recipients: SafeTransactionRecipient[], trace: string, spendPrivateKey: string): Promise<(GhostKey | undefined)[]> => {
    const traceHash = blake3Hash(Buffer.from(trace));
    const privSpend = Buffer.from(spendPrivateKey, 'hex');
    const ghostKeys: (GhostKey | undefined)[] = new Array(recipients.length).fill(undefined);
    const uuidRequests: GhostKeyRequest[] = [];

    recipients.forEach((r, i) => {
      if ('destination' in r) return;

      const ma = r.mixAddress;
      const seedHash = blake3Hash(Buffer.concat([traceHash, Buffer.from(integerToBytes(i))]));
      if (ma.xinMembers.length) {
        const privHash = blake3Hash(Buffer.concat([seedHash, privSpend]));
        const key = newKeyFromSeed(Buffer.concat([traceHash, privHash]));
        const mask = ed.publicFromPrivate(key).toString('hex');
        const keys = ma.xinMembers.map(member => {
          const pub = getPublicFromMainnetAddress(member);
          const spendKey = pub!.subarray(0, 32);
          const viewKey = pub!.subarray(32, 64);
          const k = deriveGhostPublicKey(key, viewKey, spendKey, i);
          return k.toString('hex');
        });
        ghostKeys[i] = {
          mask,
          keys,
        };
      } else {
        const hint = uniqueConversationID(traceHash.toString('hex'), seedHash.toString('hex'));
        uuidRequests.push({
          receivers: ma.uuidMembers.sort(),
          index: i,
          hint,
        });
      }
    });
    if (uuidRequests.length) {
      const ghosts = await axiosInstance.post<unknown, GhostKey[]>('/safe/keys', uuidRequests);
      ghosts.forEach((ghost, i) => {
        const { index } = uuidRequests[i];
        ghostKeys[index] = ghost;
      });
    }
    return ghostKeys;
  },
});

export const UtxoClient = buildClient(UtxoKeystoreClient);

export default UtxoClient;
