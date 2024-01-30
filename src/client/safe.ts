import { AxiosInstance } from 'axios';
import {
  Keystore,
  AuthenticationUserResponse,
  SafeAsset,
  SafeDepositEntriesRequest,
  SafeDepositEntryResponse,
  SafePendingDepositRequest,
  SafePendingDepositResponse,
  SafeSnapshot,
  SafeSnapshotsRequest,
  SafeWithdrawalFee,
} from './types';
import { buildClient, signEd25519PIN, signSafeRegistration } from './utils';

export const SafeKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  /** If you want to register safe user, you need to upgrade TIP PIN first. */
  register: (user_id: string, tipPin: string, priv: Buffer): Promise<AuthenticationUserResponse> => {
    const data = signSafeRegistration(user_id, tipPin, priv);
    data.pin_base64 = signEd25519PIN(data.pin_base64, keystore);
    return axiosInstance.post<unknown, AuthenticationUserResponse>('/safe/users', data);
  },

  checkRegisteration: () => axiosInstance.get<unknown, AuthenticationUserResponse>(`/safe/me`),

  assets: (): Promise<SafeAsset[]> => axiosInstance.get<unknown, SafeAsset[]>('/safe/assets'),

  fetchAsset: (id: string): Promise<SafeAsset> => axiosInstance.get<unknown, SafeAsset>(`/safe/assets/${id}`),

  fetchAssets: (assetIds: string[]): Promise<SafeAsset[]> => axiosInstance.post<unknown, SafeAsset[]>(`/safe/assets/fetch`, assetIds),

  fetchFee: (asset: string, destination: string) => axiosInstance.get<unknown, SafeWithdrawalFee[]>(`/safe/assets/${asset}/fees`, { params: { destination } }),

  depositEntries: (data: SafeDepositEntriesRequest) => axiosInstance.post<unknown, SafeDepositEntryResponse[]>(`/safe/deposit/entries`, data),

  createDeposit: (chain_id: string) => axiosInstance.post<unknown, SafeDepositEntryResponse[]>('/safe/deposit/entries', { chain_id }),

  pendingDeposits: (params: SafePendingDepositRequest): Promise<SafePendingDepositResponse[]> =>
    axiosInstance.get<unknown, SafePendingDepositResponse[]>(`/safe/deposits`, { params }),

  /**
   * Get snapshots for single user
   * Or Get snapshots for all network users with app uuid passed
   */
  fetchSafeSnapshots: (data: SafeSnapshotsRequest): Promise<SafeSnapshot[]> =>
    axiosInstance.get<unknown, SafeSnapshot[]>(`/safe/snapshots`, {
      params: data,
    }),

  fetchSafeSnapshot: (id: string): Promise<SafeSnapshot> => axiosInstance.get<unknown, SafeSnapshot>(`/safe/snapshots/${id}`),
});
export const SafeClient = buildClient(SafeKeystoreClient);

export default SafeClient;
