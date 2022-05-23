import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { HTTPConfig, RequestClient } from './types/client';
import { createAxiosClient, createNetworkClient, createRequestClient } from './utils/client';
import { AddressKeystoreClient } from './address';
import { AssetKestoreClient } from './asset';
import { AppKeystoreClient } from './app';
import { AttachmentKeystoreClient } from './attachment';
import { ConversationKeystoreClient } from './conversation';
import { MutilsigsKeystoreClient } from './multisigs';
import { PinKeystoreClient } from './pin';
import { TransferKeystoreClient } from './transfer';
import { UserKeystoreClient } from './user';
import { MessagesKeystoreClient } from './messages';

const KeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  address: AddressKeystoreClient(axiosInstance, keystore),
  app: AppKeystoreClient(axiosInstance),
  asset: AssetKestoreClient(axiosInstance),
  attachment: AttachmentKeystoreClient(axiosInstance),
  conversation: ConversationKeystoreClient(axiosInstance, keystore),
  messages: MessagesKeystoreClient(axiosInstance, keystore),
  multisigs: MutilsigsKeystoreClient(axiosInstance, keystore),
  pin: PinKeystoreClient(axiosInstance, keystore),
  user: UserKeystoreClient(axiosInstance),
  transfer: TransferKeystoreClient(axiosInstance, keystore),
});

type NetworkClientReturnType = ReturnType<typeof createNetworkClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: HTTPConfig):  RequestClient & NetworkClientReturnType;
export function Client(config: HTTPConfig):  KeystoreClientReturnType & RequestClient & NetworkClientReturnType;
export function Client(config: HTTPConfig) {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);
  const networkClient = createNetworkClient(axiosInstance);
  merge(networkClient, requestClient);

  const { keystore } = config;
  if (!keystore) return networkClient;

  const keystoreClient = KeystoreClient(axiosInstance, keystore);
  return merge(keystoreClient, requestClient);
}