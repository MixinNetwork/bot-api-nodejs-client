import { AxiosInstance } from 'axios';
import { getSignPIN } from 'mixin/sign';
import { request } from 'services/request';
import { Address, AddressCreateParams, Keystore } from 'types';
import { buildClient } from '../utils/build-client';

export const AddressKeystoreClient = (keystore: Keystore, axiosInstance?: AxiosInstance) => {
  const _axiosInstance = axiosInstance || request(keystore);
  return {
    createAddress: (params: AddressCreateParams, pin?: string) => _axiosInstance.post<unknown, Address>('/addresses', { ...params, pin: getSignPIN(keystore, pin) }),
    deleteAddress: (addressID: string, pin?: string) => _axiosInstance.post<unknown, void>(`/addresses/${addressID}/delete`, { pin: getSignPIN(keystore, pin) }),
  };
};

export const AddressTokenClient = (axiosInstance: AxiosInstance) => ({
  readAddress: (addressID: string) => axiosInstance.get<unknown, Address>(`/addresses/${addressID}`),
  readAddresses: (assetID: string) => axiosInstance.get<unknown, Address[]>(`/assets/${assetID}/addresses`),
});

export const AddressClient = buildClient(AddressTokenClient, AddressKeystoreClient);
