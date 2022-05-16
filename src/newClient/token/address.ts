import { AxiosInstance } from 'axios';
import { Address } from 'types';

export function AddressClient(axiosInstance: AxiosInstance) {
  return {
    readAddress: (addressID: string) => axiosInstance.get<unknown, Address>(`/addresses/${addressID}`),
    readAddresses: (assetID: string) => axiosInstance.get<unknown, Address[]>(`/assets/${assetID}/addresses`),
    deleteAddress: (addressID: string, pin?: string) => axiosInstance.post<unknown, void>(`/addresses/${addressID}/delete`, { pin }),
  };
}
