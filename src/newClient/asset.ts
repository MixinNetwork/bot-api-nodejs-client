import { AxiosInstance } from 'axios';
import { AssetResponse, ExchangeRate, NetworkTicker } from './types/asset';
import { buildClient } from "./utils/client";
import { AddressTokenClient } from "./address";

// Get information about asset
export function AssetTokenClient(axiosInstance: AxiosInstance) {
  return {
    // Get the specified asset of current user, the ASSETS:READ permission is required.
    show: (assetID: string) => axiosInstance.get<unknown, AssetResponse>(`/assets/${assetID}`),

    // Get the asset list of current user
    index: () => axiosInstance.get<unknown, AssetResponse[]>('/assets'),

    // Get the specified asset's fee
    fee: (assetID: string) => axiosInstance.get<unknown, number>(`/assets/${assetID}/fee`),

    // Get a list of all fiat exchange rates based on US Dollar.
    rates: () => axiosInstance.get<unknown, ExchangeRate[]>('/fiats'),

    // todo move to network?
    // Get the historical price of a specified asset
    historicalPrice: (asset: string, offset?: string) => axiosInstance.get<unknown, NetworkTicker>(`/network/ticker`, { params: { offset, asset } }),
  };
}

export const AssetClient = buildClient({
  TokenClient: AddressTokenClient,
})

export default AssetClient