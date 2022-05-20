import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import { PinKeystoreClient } from './pin';
import { UserKeystoreClient, UserTokenClient } from './user';
import Keystore from './types/keystore';
import { HTTPConfig, RequestClient } from './types/client';
import { createAxiosClient, createRequestClient } from './utils/client';
import { AddressKeystoreClient, AddressTokenClient } from "./address";
import { ConversationKeystoreClient } from "./conversation";
import { AssetTokenClient } from "./asset";
import { AppKeystoreClient, AppTokenClient } from "./app";
import { AttachmentKeystoreClient } from "./attachment";
import { MutilsigsTokenClient, MutilsigsKeystoreClient } from "./multisigs";
import { MessagesKeystoreClient } from "./messages";

const TokenClient = (axiosInstance: AxiosInstance) => ({
  address: AddressTokenClient(axiosInstance),
  app: AppTokenClient(axiosInstance),
  asset: AssetTokenClient(axiosInstance),
  attachment: AddressTokenClient(axiosInstance),
  multisigs: MutilsigsTokenClient(axiosInstance),
  user: UserTokenClient(axiosInstance),
});

const KeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  address: AddressKeystoreClient(keystore, axiosInstance),
  app: AppKeystoreClient(axiosInstance),
  attachment: AttachmentKeystoreClient(axiosInstance),
  conversation: ConversationKeystoreClient(keystore, axiosInstance),
  messages: MessagesKeystoreClient(keystore, axiosInstance),
  multisigs: MutilsigsKeystoreClient(keystore, axiosInstance),
  pin: PinKeystoreClient(keystore, axiosInstance),
  user: UserKeystoreClient(axiosInstance),
});

type TokenClientReturnType = ReturnType<typeof TokenClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: HTTPConfig): TokenClientReturnType & RequestClient;
export function Client(config: HTTPConfig): TokenClientReturnType & KeystoreClientReturnType & RequestClient;
export function Client(config: HTTPConfig) {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);
  const { keystore } = config;

  const tokenClient = TokenClient(axiosInstance);

  if (!keystore) return Object.assign(tokenClient, requestClient);

  const keystoreClient = KeystoreClient(keystore, axiosInstance);
  return merge(tokenClient, keystoreClient, requestClient);
}