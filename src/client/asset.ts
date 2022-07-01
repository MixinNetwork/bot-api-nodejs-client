import { AxiosInstance } from 'axios';
import { AssetResponse } from './types/asset';
import { SnapshotResponse } from './types/snapshot';
import { buildClient } from './utils/client';

/**
 * Get personal information about asset.
 * Notes:
 * * Get /assets may not have a deposit address, if you want a deposit address,
 * * should request /assets/:asset_id first.
 * https://developers.mixin.one/docs/api/assets/assets
 */
export const AssetKeystoreClient = (axiosInstance: AxiosInstance) => ({
  /** Get the specified asset of current user, the ASSETS:READ permission is required */
  fetch: (assetID: string): Promise<AssetResponse> => axiosInstance.get<unknown, AssetResponse>(`/assets/${assetID}`),

  /** Get the asset list of current user */
  fetchList: (): Promise<AssetResponse[]> => axiosInstance.get<unknown, AssetResponse[]>('/assets'),

  /** Get specific asset's snapshots of current user */
  snapshots: (assetID: string): Promise<SnapshotResponse[]> => axiosInstance.get<unknown, SnapshotResponse[]>(`/assets/${assetID}/snapshots`),
});

export const AssetClient = buildClient(AssetKeystoreClient);

export default AssetClient;
