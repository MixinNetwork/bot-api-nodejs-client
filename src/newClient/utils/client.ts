import { AxiosInstance } from 'axios';
import { request } from 'services/request';
import { Keystore } from '../types/keystore';
import { BaseClient, KeystoreClientConfig, TokenClientConfig } from '../types/client';

interface BuildClient {
  <TokenReturnType, KeystoreReturnType>(config: {
    TokenClient: (axiosInstance: AxiosInstance) => TokenReturnType;
    KeystoreClient: (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType;
  }): BaseClient<TokenReturnType, KeystoreReturnType>;
  <TokenReturnType>(config: { TokenClient: (axiosInstance: AxiosInstance) => TokenReturnType }): BaseClient<TokenReturnType, TokenReturnType>;
  <KeystoreReturnType>(config: { KeystoreClient: (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType }): BaseClient<KeystoreReturnType, KeystoreReturnType>;
}

export const createAxiosClient = (config: Partial<TokenClientConfig & KeystoreClientConfig>) => {
  const { token, keystore, axiosConfig } = config;

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
    KeystoreClient?: (keystore: Keystore, axiosInstance: AxiosInstance) => KeystoreReturnType;
  }): BaseClient<TokenReturnType, KeystoreReturnType> =>
  (config: Partial<TokenClientConfig & KeystoreClientConfig>): any => {
    const axiosInstance = createAxiosClient(config);
    const { keystore } = config;

    let tokenClient: TokenReturnType | undefined;
    if (TokenClient) tokenClient = TokenClient(axiosInstance);

    if (tokenClient || !keystore || !KeystoreClient) return tokenClient;

    let keystoreClient: KeystoreReturnType | undefined;
    if (keystore) keystoreClient = KeystoreClient(keystore, axiosInstance);

    return Object.assign(tokenClient || {}, keystoreClient);
  };
