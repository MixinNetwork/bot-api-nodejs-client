import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import {
  NFTResponse,
  NFTCollectionResponse,
  CollectibleOutputsRequest,
  NFTOutputResponse,
  CollectibleGenerateRequest,
  CollectibleRequestAction,
  NFTRequestResponse
} from './types/collectible';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

export const CollectibleKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const manageRequest = (pin: string, requestID: string, action: CollectibleRequestAction): Promise<NFTRequestResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, NFTRequestResponse>(`/collectibles/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Get the information of the collectible
    fetch: (tokenID: string): Promise<NFTResponse> => axiosInstance.get<unknown, NFTResponse>(`/collectibles/tokens/${tokenID}`),

    // Get the information of the collectible collection
    fetchCollection: (collectionID: string): Promise<NFTCollectionResponse> => axiosInstance.get<unknown, NFTCollectionResponse>(`/collectibles/collections/${collectionID}`),

    // Get collectibles outputs
    outputs: (params: CollectibleOutputsRequest): Promise<NFTOutputResponse> => axiosInstance.get<unknown, NFTOutputResponse>('/collectibles/outputs', { params }),

    // Generate a collectibles transfer request
    transfer: (data: CollectibleGenerateRequest): Promise<NFTRequestResponse> => axiosInstance.post<unknown, NFTRequestResponse>('/collectibles/requests', data),

    // Initiate or participate in signing
    sign: (pin: string, requestID: string) => manageRequest(pin, requestID, 'sign'),

    // Cancel my signature
    cancel: (pin: string, requestID: string) => manageRequest(pin, requestID, 'cancel'),

    // Cancel collectibles
    unlock: (pin: string, requestID: string) => manageRequest(pin, requestID, 'unlock'),
  };
};

export const CollectibleClient = buildClient(CollectibleKeystoreClient);

export default CollectibleClient;