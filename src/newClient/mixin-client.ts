import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { HTTPConfig, RequestClient } from './types/client';
import { createAxiosClient, createNetworkClient, createRequestClient } from './utils/client';
import { AddressKeystoreClient } from './address';
import { AssetKeystoreClient } from './asset';
import { AppKeystoreClient } from './app';
import { AttachmentKeystoreClient } from './attachment';
import { ConversationKeystoreClient } from './conversation';
import { MultisigKeystoreClient } from './multisig';
import { PinKeystoreClient } from './pin';
import { TransferKeystoreClient } from './transfer';
import { UserKeystoreClient } from './user';
import { MessageKeystoreClient } from './message';
import { CircleKeystoreClient } from './circle';
import { CollectionKeystoreClient } from './collection';
import { OAuthKeystoreClient } from './oauth';
import { ExternalKeystoreClient } from './external';

const KeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  address: AddressKeystoreClient(axiosInstance, keystore),
  app: AppKeystoreClient(axiosInstance),
  asset: AssetKeystoreClient(axiosInstance),
  attachment: AttachmentKeystoreClient(axiosInstance),
  circle: CircleKeystoreClient(axiosInstance),
  collection: CollectionKeystoreClient(axiosInstance, keystore),
  conversation: ConversationKeystoreClient(axiosInstance, keystore),
  external: ExternalKeystoreClient(axiosInstance),
  message: MessageKeystoreClient(axiosInstance, keystore),
  multisig: MultisigKeystoreClient(axiosInstance, keystore),
  oauth: OAuthKeystoreClient(axiosInstance, keystore),
  pin: PinKeystoreClient(axiosInstance, keystore),
  transfer: TransferKeystoreClient(axiosInstance, keystore),
  user: UserKeystoreClient(axiosInstance),
});

type NetworkClientReturnType = ReturnType<typeof createNetworkClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: HTTPConfig): RequestClient & NetworkClientReturnType;
export function Client(config: HTTPConfig): KeystoreClientReturnType & RequestClient & NetworkClientReturnType;
export function Client(config: HTTPConfig) {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);
  const networkClient = createNetworkClient(axiosInstance);

  const { keystore } = config;
  if (!keystore) return merge(networkClient, requestClient);

  const keystoreClient = KeystoreClient(axiosInstance, keystore);
  return merge(keystoreClient, networkClient, requestClient);
}