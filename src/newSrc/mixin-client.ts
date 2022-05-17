import { AxiosInstance } from 'axios';
import merge from 'lodash.merge';
import { request } from 'services/request';
import { AddressTokenClient, AddressKeystoreClient } from './client/address';
import { AppTokenClient } from './client/app';
import { AssetTokenClient } from './client/asset';
import { AttachmentTokenClient } from './client/attachment';
import { ConversationTokenClient, ConversationKeystoreClient } from './client/conversation';
import { PinKeystoreClient } from './client/pin';
import { UserTokenClient } from './client/user';
import { Keystore } from './types';

const TokenClient = (axiosInstance: AxiosInstance) => ({
  address: AddressTokenClient(axiosInstance),
  app: AppTokenClient(axiosInstance),
  asset: AssetTokenClient(axiosInstance),
  attachment: AttachmentTokenClient(axiosInstance),
  conversation: ConversationTokenClient(axiosInstance),
  user: UserTokenClient(axiosInstance),
});

const KeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  address: AddressKeystoreClient(keystore, axiosInstance),
  conversation: ConversationKeystoreClient(keystore, axiosInstance),
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
