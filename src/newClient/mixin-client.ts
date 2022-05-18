import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import { PinKeystoreClient } from './pin';
import { UserKeystoreClient, UserTokenClient } from './user';
import Keystore from './types/keystore';
import { TokenClientConfig, KeystoreClientConfig } from './types/client';
import { createAxiosClient } from './utils/client';

const TokenClient = (axiosInstance: AxiosInstance) => ({
  user: UserTokenClient(axiosInstance),
});

const KeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  user: UserKeystoreClient(keystore, axiosInstance),
  pin: PinKeystoreClient(keystore, axiosInstance),
});

type TokenClientReturnType = ReturnType<typeof TokenClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: TokenClientConfig): TokenClientReturnType;
export function Client(config: KeystoreClientConfig): TokenClientReturnType & KeystoreClientReturnType;
export function Client(config: Partial<TokenClientConfig & KeystoreClientConfig>) {
  const axiosInstance = createAxiosClient(config);
  const { keystore } = config;

  const tokenClient = TokenClient(axiosInstance);

  if (!keystore) return tokenClient;

  const keystoreClient = KeystoreClient(keystore, axiosInstance);
  return merge(tokenClient, keystoreClient);
}
