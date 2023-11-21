import { AxiosInstance } from 'axios';
import {
  GhostKey,
  GhostKeyRequest,
  OutputFetchRequest,
  OutputsRequest,
  SafeOutputsRequest,
  TransactionRequest,
  TransactionResponse,
  UtxoOutput,
} from './types';
import { buildClient, hashMembers } from './utils';

export const UtxoKeystoreClient = (axiosInstance: AxiosInstance) => ({
  outputs: (params: OutputsRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),

  safeOutputs: (params: SafeOutputsRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),
  
  fetchSafeOutputs: (params: OutputFetchRequest): Promise<UtxoOutput[]> => axiosInstance.post<unknown, UtxoOutput[]>('/safe/outputs/fetch', params),

  fetchTransaction: (transactionId: string): Promise<TransactionResponse> => axiosInstance.get<unknown, TransactionResponse>(`/safe/transactions/${transactionId}`),

  verifyTransaction: (params: TransactionRequest): Promise<TransactionResponse> => axiosInstance.post<unknown, TransactionResponse>('/safe/transaction/requests', params),

  sendTransactions: (params: TransactionRequest): Promise<TransactionResponse> => axiosInstance.post<unknown, TransactionResponse>('/safe/transactions', params),

  /** Get one-time information to transfer assets to single user or multisigs group, no required for Mixin Kernel Address */
  ghostKey: (params: GhostKeyRequest[]): Promise<GhostKey> => axiosInstance.post<unknown, GhostKey>('/safe/keys', params),
});

export const UtxoClient = buildClient(UtxoKeystoreClient);

export default UtxoClient;
