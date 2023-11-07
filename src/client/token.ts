import { AxiosInstance } from 'axios';
import { buildClient } from './utils';
import { PendingDeposit, SafeSnapshot, Token } from './types/token';

export const TokenKeystoreClient = (axiosInstance: AxiosInstance) => ({
  assets: (): Promise<Token[]> => axiosInstance.get<unknown, Token[]>('/safe/assets'),
  assetsById: (id: string): Promise<Token> => axiosInstance.get<unknown, Token>(`/safe/assets/${id}`),
  queryAssets: (query: string): Promise<Token[]> => axiosInstance.get<unknown, Token[]>(`/network/assets/search/${query}`),
  fetchAssets: (assetIds: string[]): Promise<Token[]> => axiosInstance.post<unknown, Token[]>(`/safe/assets/fetch`, assetIds),
  topAssets: (kind: String = 'normal'): Promise<Token[]> => axiosInstance.get<unknown, Token[]>('/network/assets/top', { params: { kind } }),
  snapshots: (
    assetId: string,
    offset: string | null = null,
    limit: number = 30,
    opponent: string | null = null,
    destination: string | null = null,
    tag: string | null = null,
  ): Promise<SafeSnapshot[]> =>
    axiosInstance.get<unknown, SafeSnapshot[]>(`/safe/snapshots`, {
      params: {
        assetId,
        offset,
        limit,
        opponent,
        destination,
        tag,
      },
    }),
  snapshotByAssetId: (asset: string, offset: String | null = null, limit: number = 30): Promise<SafeSnapshot[]> =>
    axiosInstance.get<unknown, SafeSnapshot[]>(`/safe/snapshots`, {
      params: {
        asset,
        offset,
        limit,
      },
    }),
  allSnapshots: (offset: string | null = null, limit: number = 30, opponent: string | null = null): Promise<SafeSnapshot[]> =>
    axiosInstance.get<unknown, SafeSnapshot[]>(`/safe/snapshots`, {
      params: {
        offset,
        limit,
        opponent,
      },
    }),
  snapshotById: (id: string): Promise<SafeSnapshot> => axiosInstance.get<unknown, SafeSnapshot>(`/safe/snapshots/${id}`),
  pendingDeposits: (asset: string, destination: string | null = null, tag: string | null = null): Promise<PendingDeposit[]> =>
    axiosInstance.get<unknown, PendingDeposit[]>(`/safe/deposits`, {
      params: {
        asset,
        destination,
        tag,
      },
    }),
});
export const TokenClient = buildClient(TokenKeystoreClient);

export default TokenClient;
