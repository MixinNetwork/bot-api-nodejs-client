import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AddressResponse, AddressCreateRequest } from './types/address';
import { buildClient } from './utils/client';
import { signEd25519PIN } from './utils/auth';

// Create or delete a withdrawal address
export const AddressKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Get an address by addressID
  fetch: (addressID: string): Promise<AddressResponse> => axiosInstance.get<unknown, AddressResponse>(`/addresses/${addressID}`),

  // Get a list of withdrawal addresses for the given asset
  fetchList: (assetID: string): Promise<AddressResponse[]> => axiosInstance.get<unknown, AddressResponse[]>(`/assets/${assetID}/addresses`),

  // Create a new withdrawal address
  create: (pin: string, params: AddressCreateRequest): Promise<AddressResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, AddressResponse>('/addresses', { ...params, pin: encrypted });
  },

  // Delete a specified address by addressID
  delete: (pin: string, addressID: string): Promise<any> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, any>(`/addresses/${addressID}/delete`, { pin: encrypted });
  },
});

export const AddressClient = buildClient( AddressKeystoreClient);

export default AddressClient;