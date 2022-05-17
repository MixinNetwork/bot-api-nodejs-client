import { AxiosInstance } from 'axios';
import merge from 'lodash.merge';
import { request } from 'services/request';
import { PinKeystoreClient } from './pin';
import { UserTokenClient } from './user';
import { Keystore } from './types/keystore';

const TokenClient = (axiosInstance: AxiosInstance) => ({
  user: UserTokenClient(axiosInstance),
});

const KeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  pin: PinKeystoreClient(keystore, axiosInstance),
});

type TokenClientReturnType = ReturnType<typeof TokenClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(token: string): TokenClientReturnType;
export function Client(keystore: Keystore): TokenClientReturnType & KeystoreClientReturnType;
export function Client(arg: string | Keystore) {
  const axiosInstance = request(arg);
  const tokenClient = TokenClient(axiosInstance);
  if (typeof arg === 'string') return tokenClient;

  const keystoreClient = KeystoreClient(arg, axiosInstance);
  return merge(tokenClient, keystoreClient);
}
