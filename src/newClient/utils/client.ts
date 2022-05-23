import { AxiosInstance } from 'axios';
import { http } from '../http';
import { NetworkBaseClient } from '../network';
import { BaseClient, BuildClient, HTTPConfig, KeystoreClient, RequestClient, UnionKeystoreClient } from '../types/client';

export const createAxiosClient = (config: HTTPConfig) => {
  const { keystore, requestConfig: axiosConfig } = config;
  return http(keystore, axiosConfig);
};

export const createRequestClient = (axiosInstance: AxiosInstance): RequestClient => ({
  request: config => axiosInstance.request(config),
});

export const createNetworkClient = (axiosInstance: AxiosInstance) => ({
  network: NetworkBaseClient(axiosInstance),
});

export const buildClient: BuildClient = <KeystoreReturnType>(
  KeystoreClient: UnionKeystoreClient<KeystoreReturnType>
): BaseClient<KeystoreReturnType> =>
    (config: HTTPConfig): any => {
      if (!KeystoreClient) throw new Error('keystore client is required');

      const axiosInstance = createAxiosClient(config);
      const networkClient = createNetworkClient(axiosInstance);
      const requestClient = createRequestClient(axiosInstance);

      const { keystore } = config;
      const keystoreClient = (KeystoreClient as KeystoreClient<KeystoreReturnType>)(axiosInstance, keystore);

      return Object.assign(keystoreClient, networkClient, requestClient);
    };