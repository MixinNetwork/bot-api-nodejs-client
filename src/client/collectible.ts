import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import {
  CollectibleRequestAction,
  CollectibleResponse,
  CollectionResponse,
  CollectibleOutputsRequest,
  CollectibleOutputsResponse,
  CollectibleTransactionRequest,
  CollectibleTransactionResponse
} from './types/collectible';
import { signEd25519PIN } from './utils/pin';
import { buildClient } from './utils/client';

export const MintAssetID = 'c94ac88f-4671-3976-b60a-09064f1811e8';

export const MintMinimumCost = '0.001';

export const GroupMembers = [
  '4b188942-9fb0-4b99-b4be-e741a06d1ebf',
  'dd655520-c919-4349-822f-af92fabdbdf4',
  '047061e6-496d-4c35-b06b-b0424a8a400d',
  'acf65344-c778-41ee-bacb-eb546bacfb9f',
  'a51006d0-146b-4b32-a2ce-7defbf0d7735',
  'cf4abd9c-2cfa-4b5a-b1bd-e2b61a83fabd',
  '50115496-7247-4e2c-857b-ec8680756bee',
];

export const GroupThreshold = 5;

// Users can use those APIs to manage their NFTs
// Note:
// * Before transferring a collectible, user should create a request first.
// * only unsigned request can be canceled.
// * only uncompleted sign transaction can be unlocked.
// Docs: https://developers.mixin.one/docs/api/collectibles/request
export const CollectibleKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  const manageRequest = (pin: string, requestID: string, action: CollectibleRequestAction): Promise<CollectibleTransactionResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, CollectibleTransactionResponse>(`/collectibles/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Get the information of the collectible
    fetch: (tokenID: string): Promise<CollectibleResponse> => axiosInstance.get<unknown, CollectibleResponse>(`/collectibles/tokens/${tokenID}`),

    // Get the information of the collectible collection
    fetchCollection: (collectionID: string): Promise<CollectionResponse> => axiosInstance.get<unknown, CollectionResponse>(`/collectibles/collections/${collectionID}`),

    // Get collectibles outputs
    outputs: (params: CollectibleOutputsRequest): Promise<CollectibleOutputsResponse[]> => axiosInstance.get<unknown, CollectibleOutputsResponse[]>('/collectibles/outputs', { params }),

    // Create a collectibles transfer request
    request: (data: CollectibleTransactionRequest): Promise<CollectibleTransactionResponse> => axiosInstance.post<unknown, CollectibleTransactionResponse>('/collectibles/requests', data),

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