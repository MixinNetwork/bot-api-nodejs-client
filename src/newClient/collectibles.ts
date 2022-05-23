import { AxiosInstance } from 'axios';
import {
  CollectibleRequestAction,
  CollectibleGenerateRequest,
  CollectibleOutputsRequest,
  CollectibleOutputResponse,

  CollectibleResponse, CollectibleTokenResponse, CollectibleCollectionResponse
} from './types/collectibles';
import { signEd25519PIN } from './utils/auth';
import Keystore from './types/keystore';
import { buildClient } from './utils/client';

export const CollectiblesKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const manageRequest = (pin: string, request_id: string, action: CollectibleRequestAction) => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, CollectibleResponse>(`/collectibles/requests/${request_id}/${action}`, { pin: encrypted });
  };

  return {
    // Generate a collectibles transfer request
    transfer: (data: CollectibleGenerateRequest): Promise<CollectibleResponse> => axiosInstance.post<unknown, CollectibleResponse>('/collectibles/requests', data),

    // Initiate or participate in signing
    sign: (pin: string, request_id: string) => manageRequest(pin, request_id, 'sign'),

    // Cancel my signature
    cancel: (pin: string, request_id: string) => manageRequest(pin, request_id, 'cancel'),

    // Cancel collectibles
    unlock: (pin: string, request_id: string) => manageRequest(pin, request_id, 'unlock'),

    // Get collectibles outputs
    outputs: (params: CollectibleOutputsRequest): Promise<CollectibleOutputResponse> => axiosInstance.get<unknown, CollectibleOutputResponse>('/collectibles/outputs', { params }),

    // Get the information of the collectible
    show: (token_id: string): Promise<CollectibleTokenResponse> => axiosInstance.get<unknown, CollectibleTokenResponse>(`/collectibles/tokens/${token_id}`),

    // Get the information of the collectible collection
    collection: (collection_id: string): Promise<CollectibleCollectionResponse> => axiosInstance.get<unknown, CollectibleCollectionResponse>(`/collectibles/collections/${collection_id}`)
  };
};

export const CollectiblesClient = buildClient(CollectiblesKeystoreClient);

export default CollectiblesClient;