import { AxiosInstance } from 'axios';
import { AssetResponse } from './types/asset';
import { NetworkSnapshotRequest, NetworkInfoResponse, NetworkChainResponse, NetworkAssetResponse, NetworkPriceResponse, NetworkSnapshotResponse } from './types/network';
import { buildClient } from './utils/client';

/**
 * Public methods that need no permission
 * Docs: https://developers.mixin.one/docs/api/transfer/snapshots
 */
export const NetworkBaseClient = (axiosInstance: AxiosInstance) => ({
  /** Get network info */
  info: (): Promise<NetworkInfoResponse> => axiosInstance.get<unknown, NetworkInfoResponse>('/network'),

  /** Get the list of all public chains supported by Mixin */
  chains: (): Promise<NetworkChainResponse[]> => axiosInstance.get<unknown, NetworkChainResponse[]>('/network/chains'),

  /** Get information of a chain */
  fetchChain: (chainID: string): Promise<NetworkChainResponse> => axiosInstance.get<unknown, NetworkChainResponse>(`/network/chains/${chainID}`),

  /** Get public information of an asset */
  fetchAsset: (assetID: string): Promise<NetworkAssetResponse> => axiosInstance.get<unknown, NetworkAssetResponse>(`/network/assets/${assetID}`),

  /**
   * Get the list of the top 100 assets on the entire network
   * kind parameter is used to specify the top assets, for NORMAL value will not swap lp tokens
   */
  topAssets: (kind = 'ALL'): Promise<AssetResponse[]> => {
    const params = { kind };
    return axiosInstance.get<unknown, AssetResponse[]>('/network/assets/top', { params });
  },

  /**
   * Search for popular assets by symbol or name
   * This API only returns assets with icons or prices.
   */
  searchAssets: (keyword: string, kind = 'ALL'): Promise<AssetResponse[]> => {
    const params = { kind };
    return axiosInstance.get<unknown, AssetResponse[]>(`/network/assets/search/${keyword}`, { params });
  },

  /**
   * Get the historical price of a given asset
   * If no ticker found, price_usd and price_usd will return 0
   */
  historicalPrice: (assetID: string, offset?: string): Promise<NetworkPriceResponse> => {
    const params = {
      asset: assetID,
      offset,
    };
    return axiosInstance.get<unknown, NetworkPriceResponse>(`/network/ticker`, { params });
  },

  /** Get public information of specific snapshot by snapshot_id */
  snapshot: (snapshotID: string): Promise<NetworkSnapshotResponse> => axiosInstance.get<unknown, NetworkSnapshotResponse>(`/network/snapshots/${snapshotID}`),

  /** Get public information of snapshot records, which including transfers, deposits, withdrawals, etc */
  snapshots: (inputParams: NetworkSnapshotRequest): Promise<NetworkSnapshotResponse[]> => {
    const params = {
      ...inputParams,
      order: inputParams.order || 'DESC',
    };
    return axiosInstance.get<unknown, NetworkSnapshotResponse[]>(`/network/snapshots`, { params });
  },
});

export const NetworkClient = buildClient(NetworkBaseClient);

export default NetworkClient;
