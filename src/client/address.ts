import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AddressResponse, AddressRequest } from './types/address';
import { getCreateAddressTipBody, getRemoveAddressTipBody, signEd25519PIN, signTipBody } from './utils/pin';
import { buildClient } from './utils/client';

/**
 * All tokens withdrawal needs an address
 * Should create an address first, the address can be deleted, can't be updated.
 * If the address belongs to another mixin user, the withdrawal fee will be free.
 * tag or memo can be blank.
 * Detail: https://developers.mixin.one/docs/api/withdrawal/address-add
 */
export const AddressKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  /** Get an address by addressID */
  fetch: (addressID: string): Promise<AddressResponse> => axiosInstance.get<unknown, AddressResponse>(`/addresses/${addressID}`),

  /** Get a list of withdrawal addresses for the given asset */
  fetchList: (assetID: string): Promise<AddressResponse[]> => axiosInstance.get<unknown, AddressResponse[]>(`/assets/${assetID}/addresses`),

  /** Create a new withdrawal address */
  create: (pin: string, params: AddressRequest): Promise<AddressResponse> => {
    const msg = getCreateAddressTipBody(params.asset_id, params.destination, params.tag ?? '', params.label);
    const signedTipPin = signTipBody(pin, msg);
    const encrypted = signEd25519PIN(signedTipPin, keystore);
    return axiosInstance.post<unknown, AddressResponse>('/addresses', { ...params, pin: encrypted });
  },

  /** Delete a specified address by addressID */
  delete: (pin: string, addressID: string): Promise<any> => {
    const msg = getRemoveAddressTipBody(addressID);
    const signedTipPin = signTipBody(pin, msg);
    const encrypted = signEd25519PIN(signedTipPin, keystore);
    return axiosInstance.post<unknown, any>(`/addresses/${addressID}/delete`, { pin: encrypted });
  },
});

export const AddressClient = buildClient(AddressKeystoreClient);

export default AddressClient;
