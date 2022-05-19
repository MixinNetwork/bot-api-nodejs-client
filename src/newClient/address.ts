import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AddressResponse, AddressCreateRequest } from "./types/address";
import { buildClient } from './utils/client';
import Utils from "./utils/utils";

// Get withdrawal address, needs token
export const  AddressTokenClient = (axiosInstance: AxiosInstance) => ({
  // Get an address by addressID
  show: (addressID: string) => axiosInstance.get<unknown, AddressResponse>(`/addresses/${addressID}`),

  // Get a list of withdrawal addresses for the given asset
  index: (assetID: string) => axiosInstance.get<unknown, AddressResponse[]>(`/assets/${assetID}/addresses`),
})

// Create or delete a withdrawal address, needs keystore
export const AddressKeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  // Create a new withdrawal address
  create: (params: AddressCreateRequest, pin?: string) => {
    const _pin = pin || keystore.pin
    params.pin = Utils.signEd25519PIN(_pin, keystore);
    return axiosInstance.post<unknown, AddressResponse>('/addresses', params);
  },

  // Delete a specified address by addressID
  delete: (addressID: string, pin?: string) => {
    const _pin = Utils.signEd25519PIN(pin || keystore.pin, keystore);
    return axiosInstance.post<unknown, void>(`/addresses/${addressID}/delete`, { _pin })
  },
});

export const AddressClient = buildClient({
  TokenClient: AddressTokenClient,
  KeystoreClient: AddressKeystoreClient,
});

export default AddressClient