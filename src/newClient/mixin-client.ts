import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import { PinKeystoreClient } from './pin';
import { UserKeystoreClient, UserTokenClient } from './user';
import Keystore from './types/keystore';
import { TokenClientConfig, KeystoreClientConfig, RequestClient } from './types/client';
import { createAxiosClient, createRequestClient } from './utils/client';

const TokenClient = (axiosInstance: AxiosInstance) => ({
  user: UserTokenClient(axiosInstance),
});

const KeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  pin: PinKeystoreClient(keystore, axiosInstance),
  user: UserKeystoreClient(axiosInstance),
});

type TokenClientReturnType = ReturnType<typeof TokenClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: TokenClientConfig): TokenClientReturnType & RequestClient;
export function Client(config: KeystoreClientConfig): TokenClientReturnType & KeystoreClientReturnType & RequestClient;
export function Client(config: Partial<TokenClientConfig & KeystoreClientConfig>) {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);
  const { keystore } = config;

  const tokenClient = TokenClient(axiosInstance);

  if (!keystore) return Object.assign(tokenClient, requestClient);

  const keystoreClient = KeystoreClient(keystore, axiosInstance);
  return merge(tokenClient, keystoreClient, requestClient);
}
