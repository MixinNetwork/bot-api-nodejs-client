import type { AxiosInstance } from 'axios';
import type { BaseClient, BuildClient, HTTPConfig, KeystoreClient, RequestClient, RequestConfig, UnionKeystoreClient } from '../types/client';
import type { Keystore } from '../types/keystore';
import { http } from '../http';

export const createAxiosClient = (keystore?: Keystore, requestConfig?: RequestConfig) => http(keystore, requestConfig);

export const createRequestClient = (axiosInstance: AxiosInstance): RequestClient => ({
  // The HTTP response interceptor unwraps the API payload.
  request: <T>(config: Parameters<RequestClient['request']>[0]) => axiosInstance.request<unknown, T>(config) as Promise<T>,
});

export const buildClient: BuildClient =
  <KeystoreReturnType extends object>(KeystoreClient: UnionKeystoreClient<KeystoreReturnType>): BaseClient<KeystoreReturnType> =>
  (config: HTTPConfig = {}): any => {
    if (!KeystoreClient) throw new Error('keystore client is required');

    const { keystore, requestConfig } = config;
    const axiosInstance = createAxiosClient(keystore, requestConfig);
    const requestClient = createRequestClient(axiosInstance);
    const keystoreClient = (KeystoreClient as KeystoreClient<KeystoreReturnType>)(axiosInstance, keystore);

    return Object.assign(keystoreClient, requestClient);
  };
