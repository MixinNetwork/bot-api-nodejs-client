import { AxiosInstance } from "axios";
import { Asset, AssetClientRequest, ExchangeRate } from "../types";


export class AssetClient implements AssetClientRequest {
  request!: AxiosInstance

  readAsset(assetID: string): Promise<Asset> {
    return this.request.get(`/assets/${assetID}`)
  }

  readAssets(): Promise<Asset[]> {
    return this.request.get('/assets')
  }

  readAssetFee(assetID: string): Promise<number> {
    return this.request.get(`/assets/${assetID}/fee`)
  }

  readExchangeRates(): Promise<ExchangeRate[]> {
    return this.request.get('/fiats')
  }
}