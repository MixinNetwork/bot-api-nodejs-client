import { AxiosInstance } from 'axios';
import { Asset, ExchangeRate, NetworkTicker } from 'types';

export function AssetClient(axiosInstance: AxiosInstance) {
  return {
    readAsset: (assetID: string) => axiosInstance.get<unknown, Asset>(`/assets/${assetID}`),
    readAssets: () => axiosInstance.get<unknown, Asset[]>('/assets'),
    readAssetFee: (assetID: string) => axiosInstance.get<unknown, number>(`/assets/${assetID}/fee`),
    readExchangeRates: () => axiosInstance.get<unknown, ExchangeRate[]>('/fiats'),
    // todo move to network?
    readAssetNetworkTicker: (asset: string, offset?: string) => axiosInstance.get<unknown, NetworkTicker>(`/network/ticker`, { params: { offset, asset } }),
  };
}
