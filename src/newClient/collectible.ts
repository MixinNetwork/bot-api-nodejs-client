import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import {
  CollectibleRequestAction,
  CollectibleResponse,
  CollectionResponse,
  CollectibleOutputsRequest,
  CollectibleOutputsResponse,
  CollectibleGenerateRequest,
  CollectibleGenerateResponse
} from './types/collectible';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

export const CollectibleKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const manageRequest = (pin: string, requestID: string, action: CollectibleRequestAction): Promise<CollectibleGenerateResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, CollectibleGenerateResponse>(`/collectibles/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Get the information of the collectible
    fetch: (tokenID: string): Promise<CollectibleResponse> => axiosInstance.get<unknown, CollectibleResponse>(`/collectibles/tokens/${tokenID}`),

    // Get the information of the collectible collection
    fetchCollection: (collectionID: string): Promise<CollectionResponse> => axiosInstance.get<unknown, CollectionResponse>(`/collectibles/collections/${collectionID}`),

    // Get collectibles outputs
    outputs: (params: CollectibleOutputsRequest): Promise<CollectibleOutputsResponse> => axiosInstance.get<unknown, CollectibleOutputsResponse>('/collectibles/outputs', { params }),

    // Generate a collectibles transfer request
    request: (data: CollectibleGenerateRequest): Promise<CollectibleGenerateResponse> => axiosInstance.post<unknown, CollectibleGenerateResponse>('/collectibles/requests', data),

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