import { AxiosInstance } from 'axios';
import { getSignPIN } from 'mixin/sign';
import { request } from 'services/request';
import { Address, AddressCreateParams, Keystore } from 'types';

export function AddressClient(keystore: Keystore, axiosInstance?: AxiosInstance) {
  const _axiosInstance = axiosInstance || request(keystore);
  return {
    createAddress: (params: AddressCreateParams, pin?: string) => {
      params.pin = getSignPIN(keystore, pin);
      return _axiosInstance.post<unknown, Address>('/addresses', params);
    },
    deleteAddress: (addressID: string, pin?: string) => {
      pin = getSignPIN(keystore, pin);
      return _axiosInstance.post<unknown, void>(`/addresses/${addressID}/delete`, {pin})
    },
  };
}
