import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import { PinKeystoreClient } from './pin';
import { UserKeystoreClient } from './user';
import Keystore from './types/keystore';
import { HTTPConfig, RequestClient } from './types/client';
import { createAxiosClient, createRequestClient } from './utils/client';
import { AddressKeystoreClient } from "./address";
import { ConversationKeystoreClient } from "./conversation";
import { AssetKestoreClient } from "./asset";
import { AppKeystoreClient } from "./app";
import { AttachmentKeystoreClient } from "./attachment";
import { MutilsigsKeystoreClient } from "./multisigs";
import { TransferKeystoreClient } from './transfer';

const KeystoreClient = (keystore: Keystore | undefined, axiosInstance: AxiosInstance) => ({
  address: AddressKeystoreClient(keystore, axiosInstance),
  asset: AssetKestoreClient(axiosInstance),
  app: AppKeystoreClient(axiosInstance),
  attachment: AttachmentKeystoreClient(axiosInstance),
  conversation: ConversationKeystoreClient(keystore, axiosInstance),
  multisigs: MutilsigsKeystoreClient(keystore, axiosInstance),
  pin: PinKeystoreClient(keystore, axiosInstance),
  user: UserKeystoreClient(axiosInstance),
  transfer: TransferKeystoreClient(keystore, axiosInstance),
});

type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: HTTPConfig):  RequestClient;
export function Client(config: HTTPConfig):  KeystoreClientReturnType & RequestClient;
export function Client(config: HTTPConfig) {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);
  const { keystore } = config;

  const keystoreClient = KeystoreClient(keystore, axiosInstance);
  return merge(keystoreClient, requestClient);
}
