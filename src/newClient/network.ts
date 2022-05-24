import { AxiosInstance } from 'axios';
import { mixinRequest } from './http';
import { AssetResponse } from './types/asset';
import { ConversationResponse } from './types/conversation';
import { CheckAddressRequest, CheckAddressResponse, GhostInput, GhostKeys, NetworkAssetResponse, NetworkChainResponse, NetworkPrice, NetworkSnapshot, ExternalTransactionResponse, DepositFilterRequest, SnapshotFilterRequest } from './types/network';

// Methods need no permission
export const NetworkBaseClient = (axiosInstance: AxiosInstance) => ({
  // Get the list of all public chains supported by Mixin
  chains: (): Promise<NetworkChainResponse[]> => axiosInstance.get<unknown, NetworkChainResponse[]>('/network/chains'),

  // Query public information of an asset
  fetchAsset: (assetID: string): Promise<NetworkAssetResponse> => axiosInstance.get<unknown, NetworkAssetResponse>(`network/assets/${assetID}`),

  // Query the list of the top 100 assets on the entire network
  topAssets: (kind = 'ALL'): Promise<AssetResponse[]> => {
    const params = { kind };
    return axiosInstance.get<unknown, AssetResponse[]>('/network/assets/top', { params });
  },

  // Search for popular assets by symbol or name
  searchAssets: (keyword: string, kind = 'ALL'): Promise<AssetResponse[]> => {
    const params = { kind };
    return axiosInstance.get<unknown, AssetResponse[]>(`/network/assets/search/${keyword}`, { params });
  },

  // Get the historical price of a given asset
  historicalPrice: (assetID: string, offset?: string): Promise<NetworkPrice> => {
    const params = {
      asset: assetID,
      offset
    };
    return axiosInstance.get<unknown, NetworkPrice>(`/network/ticker`, { params });
  },

  // Get snapshot records public information, which including transfers, deposits, withdrawals, etc
  snapshots: (inputParams: SnapshotFilterRequest): Promise<NetworkSnapshot[]> => {
    const params = {
      ...inputParams,
      order: inputParams.order || 'DESC'
    };
    return axiosInstance.get<unknown, NetworkSnapshot[]>(`/network/snapshots`, { params });
  },

  // Get snapshot details by snapshot_id
  snapshot: (snapshotID: string): Promise<NetworkSnapshot> => axiosInstance.get<unknown, NetworkSnapshot>(`/network/snapshots/${snapshotID}`),

  // Get one-time user keys
  outputs: (input: GhostInput): Promise<GhostKeys[]> => axiosInstance.post<unknown, GhostKeys[]>(`/network/outputs`, input),

  // Get public network-wide deposit records
  deposit: (params: DepositFilterRequest): Promise<ExternalTransactionResponse[]> => axiosInstance.get<unknown, ExternalTransactionResponse[]>('/external/transactions', { params }),

  // Get conversation information by conversationID
  fetchConversation: (conversationID: string): Promise<ConversationResponse> => axiosInstance.get<unknown, ConversationResponse>(`/conversations/${conversationID}`),

  // Check if the address is the inner one
  externalAddressesCheck: (params: CheckAddressRequest): Promise<CheckAddressResponse> => mixinRequest.get(`/external/addresses/check`, { params }),
});

export const NetworkClient = NetworkBaseClient(mixinRequest);

export default NetworkClient;