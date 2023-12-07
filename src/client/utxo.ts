import { AxiosInstance } from 'axios';
import {
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
} from './types';
import { buildClient, getTotalBalanceFromOutputs, hashMembers } from './utils';

export const UtxoKeystoreClient = (axiosInstance: AxiosInstance) => ({
  outputs: (params: OutputsRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),

  /**
   * asset should be SHA256Hash of asset_id, otherwise asset param would not work
   */
  safeOutputs: (params: SafeOutputsRequest): Promise<SafeUtxoOutput[]> =>
    axiosInstance.get<unknown, SafeUtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),

  safeAssetBalance: async (params: SafeBalanceRequest) => {
    const outputs = await axiosInstance.get<unknown, SafeUtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
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
   * receivers will be sorted in the function
   */
  ghostKey: (params: GhostKeyRequest[]): Promise<GhostKey[]> => {
    params = params.map(p => ({
      ...p,
      receivers: p.receivers.sort(),
    }));
    return axiosInstance.post<unknown, GhostKey[]>('/safe/keys', params);
  },
});

export const UtxoClient = buildClient(UtxoKeystoreClient);

export default UtxoClient;
