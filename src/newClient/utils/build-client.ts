import { AxiosInstance } from 'axios';
import { request } from 'services/request';
import { Keystore } from '../types/keystore';
import { BaseClient } from '../types/client';

interface BuildClient {
  <TokenReturnType, KeystoreReturnType>(
    TokenClient: (axiosInstance: AxiosInstance) => TokenReturnType,
    KeystoreClient: (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType,
  ): BaseClient<TokenReturnType, KeystoreReturnType>;
  <TokenReturnType>(TokenClient: (axiosInstance: AxiosInstance) => TokenReturnType): BaseClient<TokenReturnType, TokenReturnType>;
}

export const buildClient: BuildClient =
  <TokenReturnType, KeystoreReturnType>(
    TokenClient: (axiosInstance: AxiosInstance) => TokenReturnType,
    KeystoreClient?: (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType,
  ): BaseClient<TokenReturnType, KeystoreReturnType> =>
  (arg: any): any => {
    const axiosInstance = request(arg);
    const tokenClient = TokenClient(axiosInstance);
    if (typeof arg === 'string' || !KeystoreClient) return tokenClient;

    return Object.assign(tokenClient, KeystoreClient?.(arg, axiosInstance));
  };
