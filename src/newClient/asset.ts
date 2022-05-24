import { AxiosInstance } from 'axios';
import { AssetFeeResponse, AssetResponse, ExchangeRateResponse } from './types/asset';
import { buildClient } from './utils/client';

// Get information about asset
export const AssetKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get the specified asset of current user, the ASSETS:READ permission is required.
  fetch: (assetID: string): Promise<AssetResponse> => axiosInstance.get<unknown, AssetResponse>(`/assets/${assetID}`),

  // Get the asset list of current user
  fetchList: (): Promise<AssetResponse[]> => axiosInstance.get<unknown, AssetResponse[]>('/assets'),

  // Get the specified asset's withdrawal fee
  withdrawalFee: (assetID: string): Promise<AssetFeeResponse> => axiosInstance.get<unknown, AssetFeeResponse>(`assets/${assetID}/fee`),

  // Get a list of all fiat exchange rates based on US Dollar.
  rates: (): Promise<ExchangeRateResponse[]> => axiosInstance.get<unknown, ExchangeRateResponse[]>('/fiats'),
});

export const AssetClient = buildClient(AssetKeystoreClient);

export default AssetClient;