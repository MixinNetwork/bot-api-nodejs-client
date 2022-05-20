import { AxiosInstance } from 'axios';
import { http } from '../http';
import { BaseClient, BuildClient, BaseInnerClient, HTTPConfig, KeystoreClient, RequestClient, UnionKeystoreClient } from '../types/client';

export const createAxiosClient = (config: HTTPConfig) => {
  const { token, keystore, requestConfig: axiosConfig } = config;

  let axiosInstance: AxiosInstance;
  if (token) {
    axiosInstance = http(token, axiosConfig);
  } else if (keystore) {
    axiosInstance = http(keystore, axiosConfig);
  } else {
    axiosInstance = http('', axiosConfig);
  }

  return axiosInstance;
};

export const createRequestClient = (axiosInstance: AxiosInstance): RequestClient => ({
  request: config => axiosInstance.request(config),
});

export const buildClient: BuildClient =
  <TokenReturnType, KeystoreReturnType>({
    TokenClient,
    KeystoreClient,
  }: {
    TokenClient?: BaseInnerClient<TokenReturnType>;
    KeystoreClient?: UnionKeystoreClient<KeystoreReturnType>;
  }): BaseClient<TokenReturnType, KeystoreReturnType> =>
  (config: HTTPConfig): any => {
    const axiosInstance = createAxiosClient(config);
    const requestClient = createRequestClient(axiosInstance);

    const { keystore } = config;

    const tokenClient = TokenClient?.(axiosInstance);
    if (!keystore || !KeystoreClient) {
      if (!tokenClient) throw new Error('Either token or keystore is required');

      return Object.assign(tokenClient, requestClient);
    }

    let keystoreClient: KeystoreReturnType | undefined;
    switch (KeystoreClient.length) {
      case 1:
        keystoreClient = (KeystoreClient as BaseInnerClient<KeystoreReturnType>)(axiosInstance);
        break;
      case 2:
        keystoreClient = (KeystoreClient as KeystoreClient<KeystoreReturnType>)(keystore, axiosInstance);
        break;
      default:
        throw new Error('KeystoreClient must have 1 or 2 arguments');
    }

    return Object.assign(tokenClient || {}, keystoreClient, requestClient);
  };
