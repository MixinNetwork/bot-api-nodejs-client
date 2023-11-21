import { AxiosInstance } from 'axios';
import {
  AssetResponse,
  Deposit,
  DepositEntryRequest,
  GhostKey,
  GhostKeyRequest,
  Keystore,
  OutputFetchRequest,
  OutputRequest,
  RegisterResponse,
  TransactionRequest,
  TransactionResponse,
  UtxoOutput,
} from './types';
import { buildClient, hashMembers, signSafeRegistration, signEd25519PIN } from './utils';

export const UtxoKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  fetchList: (params: OutputRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/safe/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),

  createDeposit: (params: DepositEntryRequest): Promise<Deposit[]> => axiosInstance.post<unknown, Deposit[]>('/safe/deposit_entries', params),

  registerPublicKey: (user_id: string, tipPin: string, seed: Buffer): Promise<RegisterResponse> => {
    const data = signSafeRegistration(user_id, tipPin, seed);
    data.pin_base64 = signEd25519PIN(data.pin_base64, keystore);
    return axiosInstance.post<unknown, RegisterResponse>('/safe/users', data);
  },

  ghostKey: (params: GhostKeyRequest[]): Promise<GhostKey> => axiosInstance.post<unknown, GhostKey>('/safe/keys', params),

  transactionRequest: (params: TransactionRequest): Promise<TransactionResponse> => axiosInstance.post<unknown, TransactionResponse>('/safe/transaction/requests', params),

  transactions: (params: TransactionRequest): Promise<TransactionResponse> => axiosInstance.post<unknown, TransactionResponse>('/safe/transactions', params),

  transactionById: (transactionId: string): Promise<TransactionResponse> => axiosInstance.get<unknown, TransactionResponse>(`/safe/transactions/${transactionId}`),

  fetch: (params: OutputFetchRequest): Promise<UtxoOutput[]> => axiosInstance.post<unknown, UtxoOutput[]>('/safe/outputs/fetch', params),

  assetByMixinId: (mixinId: string): Promise<AssetResponse> => axiosInstance.get<unknown, AssetResponse>(`/safe/assets/${mixinId}`),
});

export const UtxoClient = buildClient(UtxoKeystoreClient);

export default UtxoClient;
