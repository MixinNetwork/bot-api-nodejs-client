import { AxiosInstance } from 'axios';
import { CollectibleRequestAction, CollectibleGenerateRequest, CollectibleOutputsRequest, CollectibleOutputResponse, CollectibleResponse, CollectibleTokenResponse, CollectibleCollectionResponse } from './types/collectibles';
import { signEd25519PIN } from './utils/auth';
import Keystore from './types/keystore';
import { buildClient } from './utils/client';

export const CollectiblesKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const manageRequest = (pin: string, requestID: string, action: CollectibleRequestAction): Promise<CollectibleResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, CollectibleResponse>(`/collectibles/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Generate a collectibles transfer request
    transfer: (data: CollectibleGenerateRequest): Promise<CollectibleResponse> => axiosInstance.post<unknown, CollectibleResponse>('/collectibles/requests', data),

    // Initiate or participate in signing
    sign: (pin: string, requestID: string) => manageRequest(pin, requestID, 'sign'),

    // Cancel my signature
    cancel: (pin: string, requestID: string) => manageRequest(pin, requestID, 'cancel'),

    // Cancel collectibles
    unlock: (pin: string, requestID: string) => manageRequest(pin, requestID, 'unlock'),

    // Get collectibles outputs
    outputs: (params: CollectibleOutputsRequest): Promise<CollectibleOutputResponse> => axiosInstance.get<unknown, CollectibleOutputResponse>('/collectibles/outputs', { params }),

    // Get the information of the collectible
    fetch: (tokenID: string): Promise<CollectibleTokenResponse> => axiosInstance.get<unknown, CollectibleTokenResponse>(`/collectibles/tokens/${tokenID}`),

    // Get the information of the collectible collection
    fetchCollection: (collectionID: string): Promise<CollectibleCollectionResponse> => axiosInstance.get<unknown, CollectibleCollectionResponse>(`/collectibles/collections/${collectionID}`)
  };
};

export const CollectiblesClient = buildClient(CollectiblesKeystoreClient);

export default CollectiblesClient;