import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { HTTPConfig, RequestClient } from './types/client';
import { createAxiosClient, createRequestClient } from './utils/client';
import { AddressKeystoreClient } from './address';
import { AssetKestoreClient } from './asset';
import { AppKeystoreClient } from './app';
import { AttachmentKeystoreClient } from './attachment';
import { ConversationKeystoreClient } from './conversation';
import { MutilsigsKeystoreClient } from './multisigs';
import { PinKeystoreClient } from './pin';
import { TransferKeystoreClient } from './transfer';
import { UserKeystoreClient } from './user';

const KeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  address: AddressKeystoreClient(axiosInstance, keystore),
  asset: AssetKestoreClient(axiosInstance),
  app: AppKeystoreClient(axiosInstance),
  attachment: AttachmentKeystoreClient(axiosInstance),
  conversation: ConversationKeystoreClient(axiosInstance, keystore),
  multisigs: MutilsigsKeystoreClient(axiosInstance, keystore),
  pin: PinKeystoreClient(axiosInstance, keystore),
  user: UserKeystoreClient(axiosInstance),
  transfer: TransferKeystoreClient(axiosInstance, keystore),
});

type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: HTTPConfig):  RequestClient;
export function Client(config: HTTPConfig):  KeystoreClientReturnType & RequestClient;
export function Client(config: HTTPConfig) {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);
  const { keystore } = config;

  const keystoreClient = KeystoreClient(axiosInstance, keystore);
  return merge(keystoreClient, requestClient);
}
