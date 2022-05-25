import { AxiosInstance } from 'axios';
import {
  CollectibleRequestAction,
  CollectibleGenerateRequest,
  CollectibleOutputsRequest,
  NFTOutputResponse,
  NFTRequestResponse,
  NFTResponse,
  NFTCollectionResponse,
} from './types/collection';
import { signEd25519PIN } from './utils/auth';
import Keystore from './types/keystore';
import { buildClient } from './utils/client';

export const CollectionKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const manageRequest = (pin: string, requestID: string, action: CollectibleRequestAction): Promise<NFTRequestResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, NFTRequestResponse>(`/collectibles/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Get collectibles outputs
    outputs: (params: CollectibleOutputsRequest): Promise<NFTOutputResponse> => axiosInstance.get<unknown, NFTOutputResponse>('/collectibles/outputs', { params }),

    // Get the information of the collectible
    fetch: (tokenID: string): Promise<NFTResponse> => axiosInstance.get<unknown, NFTResponse>(`/collectibles/tokens/${tokenID}`),

    // Get the information of the collectible collection
    fetchCollection: (collectionID: string): Promise<NFTCollectionResponse> => axiosInstance.get<unknown, NFTCollectionResponse>(`/collectibles/collections/${collectionID}`),

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

export const CollectionClient = buildClient(CollectionKeystoreClient);

export default CollectionClient;