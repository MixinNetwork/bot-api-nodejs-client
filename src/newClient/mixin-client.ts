import merge from 'lodash.merge';
import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { HTTPConfig, RequestClient } from './types/client';
import { createAxiosClient, createRequestClient } from './utils/client';
import { AddressKeystoreClient } from './address';
import { AppKeystoreClient } from './app';
import { AssetKeystoreClient } from './asset';
import { AttachmentKeystoreClient } from './attachment';
import { CircleKeystoreClient } from './circle';
import { CodeKeystoreClient } from './code';
import { CollectibleKeystoreClient } from './collectible';
import { ConversationKeystoreClient } from './conversation';
import { ExternalKeystoreClient } from './external';
import { MessageKeystoreClient } from './message';
import { MultisigKeystoreClient } from './multisig';
import { NetworkBaseClient } from './network';
import { OAuthKeystoreClient } from './oauth';
import { PinKeystoreClient } from './pin';
import { TransferKeystoreClient } from './transfer';
import { UserKeystoreClient } from './user';
import { WithdrawalKeystoreClient } from './withdrawal';
import { BlazeClient } from './blaze';

const KeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  address: AddressKeystoreClient(axiosInstance, keystore),
  app: AppKeystoreClient(axiosInstance),
  asset: AssetKeystoreClient(axiosInstance),
  attachment: AttachmentKeystoreClient(axiosInstance),
  circle: CircleKeystoreClient(axiosInstance),
  code: CodeKeystoreClient(axiosInstance),
  collection: CollectibleKeystoreClient(axiosInstance, keystore),
  conversation: ConversationKeystoreClient(axiosInstance, keystore),
  external: ExternalKeystoreClient(axiosInstance),
  message: MessageKeystoreClient(axiosInstance, keystore),
  multisig: MultisigKeystoreClient(axiosInstance, keystore),
  network: NetworkBaseClient(axiosInstance),
  oauth: OAuthKeystoreClient(axiosInstance, keystore),
  pin: PinKeystoreClient(axiosInstance, keystore),
  transfer: TransferKeystoreClient(axiosInstance, keystore),
  user: UserKeystoreClient(axiosInstance),
  withdrawal: WithdrawalKeystoreClient(axiosInstance, keystore),
});

type BlazeClientReturnType = ReturnType<typeof BlazeClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(config: HTTPConfig): KeystoreClientReturnType & RequestClient;
export function Client(config: HTTPConfig): BlazeClientReturnType & KeystoreClientReturnType & RequestClient;
export function Client(config: HTTPConfig): KeystoreClientReturnType & RequestClient {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);

  const { keystore } = config;
  const keystoreClient = KeystoreClient(axiosInstance, keystore);
  if (!keystore) return merge(keystoreClient, requestClient);

  const blazeClient = BlazeClient(keystore, config.blazeOptions);
  return merge(keystoreClient, blazeClient, requestClient);
}