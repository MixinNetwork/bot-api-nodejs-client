import { AxiosInstance } from 'axios';
import { buildClient } from './utils/client';
import {
  UtxoOutput,
  OutputRequest,
  DepositEntryRequest,
  Deposit,
  RegisterRequest,
  RegisterResponse,
  GhostKeyRequest,
  GhostKey,
  TransactionRequest,
  TransactionResponse,
  OutputFetchRequest,
} from './types/utxo';
import { hashMembers } from './utils';

export const UtxoKeystoreClient = (axiosInstance: AxiosInstance) => ({
  fetchList: (params: OutputRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),

  createDeposit: (params: DepositEntryRequest): Promise<Deposit[]> => axiosInstance.post<unknown, Deposit[]>('/safe/deposit_entries', params),

  registerPublicKey: (params: RegisterRequest): Promise<RegisterResponse> => axiosInstance.post<unknown, RegisterResponse>('/safe/users', params),

  ghostKey: (params: GhostKeyRequest[]): Promise<GhostKey> => axiosInstance.post<unknown, GhostKey>('/safe/keys', params),

  transactionRequest: (params: TransactionRequest): Promise<TransactionResponse> => axiosInstance.post<unknown, TransactionResponse>('/safe/transaction/requests', params),

  transactions: (params: TransactionRequest): Promise<TransactionResponse> => axiosInstance.post<unknown, TransactionResponse>('/safe/transactions', params),

  fetch: (params: OutputFetchRequest): Promise<UtxoOutput[]> => axiosInstance.post<unknown, UtxoOutput[]>('/safe/outputs/fetch', params),
});

export const UtxoClient = buildClient(UtxoKeystoreClient);

export default UtxoClient;
