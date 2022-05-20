import { AxiosInstance } from 'axios';
import { AssetResponse, ExchangeRate } from './types/asset';
import { buildClient } from "./utils/client";
import { AddressTokenClient } from "./address";

// Get information about asset
export const AssetTokenClient = (axiosInstance: AxiosInstance) => ({
  // Get the specified asset of current user, the ASSETS:READ permission is required.
  show: (assetID: string) => axiosInstance.get<unknown, AssetResponse>(`/assets/${assetID}`),

  // Get the asset list of current user
  index: () => axiosInstance.get<unknown, AssetResponse[]>('/assets'),

  // Get a list of all fiat exchange rates based on US Dollar.
  rates: () => axiosInstance.get<unknown, ExchangeRate[]>('/fiats'),
});

export const AssetClient = buildClient({
  TokenClient: AddressTokenClient,
});

export default AssetClient;
