import { AxiosInstance } from 'axios';
import { BaseClient, BuildClient, HTTPConfig, KeystoreClient, RequestClient, RequestConfig, UnionKeystoreClient } from '../types/client';
import type { Keystore, InitKeystore } from '../types/keystore';
import { http } from '../http';

export const createAxiosClient = (keystore?: Keystore, requestConfig?: RequestConfig) => http(keystore, requestConfig);

export const createRequestClient = (axiosInstance: AxiosInstance): RequestClient => ({
  request: config => axiosInstance.request(config),
});

export const createKeystore = (k: InitKeystore | undefined) => {
  if (!k || 'user_id' in k) return k;
  return {
    ...k,
    user_id: k.client_id,
  };
};

export const buildClient: BuildClient =
  <KeystoreReturnType extends object>(KeystoreClient: UnionKeystoreClient<KeystoreReturnType>): BaseClient<KeystoreReturnType> =>
  (config: HTTPConfig = {}): any => {
    if (!KeystoreClient) throw new Error('keystore client is required');

    const { keystore: initKeystore, requestConfig } = config;
    const keystore = createKeystore(initKeystore);

    const axiosInstance = createAxiosClient(keystore, requestConfig);
    const requestClient = createRequestClient(axiosInstance);
    const keystoreClient = (KeystoreClient as KeystoreClient<KeystoreReturnType>)(axiosInstance, keystore);

    return Object.assign(keystoreClient, requestClient);
  };
