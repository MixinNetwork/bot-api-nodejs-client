import { AxiosInstance } from 'axios';
import { http } from '../http';
import { NetworkClient } from '../network';
import { BaseClient, BuildClient, HTTPConfig, KeystoreClient, RequestClient, UnionKeystoreClient } from '../types/client';

export const createAxiosClient = (config: HTTPConfig) => {
  const { token, keystore, requestConfig: axiosConfig } = config;

  let axiosInstance: AxiosInstance = http('', axiosConfig);
  if (token) {
    axiosInstance = http(token, axiosConfig);
  } else if (keystore) {
    axiosInstance = http(keystore, axiosConfig);
  }

  return axiosInstance;
};

export const createRequestClient = (axiosInstance: AxiosInstance): RequestClient => ({
  request: config => axiosInstance.request(config),
});

export const createNetworkClient = (axiosInstance: AxiosInstance) => ({
  network: NetworkClient(axiosInstance),
});

export const buildClient: BuildClient =
  <KeystoreReturnType>({
    KeystoreClient,
  }: {
    KeystoreClient: UnionKeystoreClient<KeystoreReturnType>;
  }): BaseClient<KeystoreReturnType> =>
  (config: HTTPConfig): any => {
    const axiosInstance = createAxiosClient(config);
    const requestClient = createRequestClient(axiosInstance);
    const { keystore } = config;

    if (!KeystoreClient) {
      throw new Error('keystore client is required');
    }

    const keystoreClient = (KeystoreClient as KeystoreClient<KeystoreReturnType>)(axiosInstance, keystore);

    return Object.assign(keystoreClient, requestClient);
  };