import { AxiosInstance } from 'axios';
import { request } from 'services/request';
import { Keystore } from '../types/keystore';
import { BaseClient, BuildClient, KeystoreClientConfig, BaseInnerClient, TokenClientConfig, KeystoreClient } from '../types/client';

export const createAxiosClient = (config: Partial<TokenClientConfig & KeystoreClientConfig>) => {
  const { token, keystore, requestConfig: axiosConfig } = config;

  let axiosInstance: AxiosInstance;
  if (token) {
    axiosInstance = request(token, axiosConfig);
  } else if (keystore) {
    axiosInstance = request(keystore, axiosConfig);
  } else {
    throw new Error('Either token or keystore is required');
  }

  return axiosInstance;
};

export const buildClient: BuildClient =
  <TokenReturnType, KeystoreReturnType>({
    TokenClient,
    KeystoreClient,
  }: {
    TokenClient?: (axiosInstance: AxiosInstance) => TokenReturnType;
    KeystoreClient?: ((keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType) | ((axiosInstance: AxiosInstance) => KeystoreReturnType);
  }): BaseClient<TokenReturnType, KeystoreReturnType> =>
  (config: Partial<TokenClientConfig & KeystoreClientConfig>): any => {
    const axiosInstance = createAxiosClient(config);
    const { keystore } = config;

    let tokenClient: TokenReturnType | undefined;
    if (TokenClient) tokenClient = TokenClient(axiosInstance);

    if (tokenClient || !keystore || !KeystoreClient) return tokenClient;

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

    return Object.assign(tokenClient || {}, keystoreClient);
  };
