import { AxiosInstance } from 'axios';
import { BaseClient } from 'newSrc/types';
import { request } from 'services/request';
import { Keystore } from 'types';

export const buildClient =
  <TokenReturnType, KeystoreReturnType>(
    TokenClient: (axiosInstance: AxiosInstance) => TokenReturnType,
    KeystoreClient: (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType,
  ): BaseClient<TokenReturnType, KeystoreReturnType> =>
  (arg: any): any => {
    const axiosInstance = request(arg);
    const tokenClient = TokenClient(axiosInstance);
    if (typeof arg === 'string') return tokenClient;

    return Object.assign(tokenClient, KeystoreClient(arg, axiosInstance));
  };
