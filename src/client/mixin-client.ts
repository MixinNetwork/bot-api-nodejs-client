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
import { BlazeKeystoreClient } from './blaze';

const KeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined, config: HTTPConfig) => ({
  address: AddressKeystoreClient(axiosInstance, keystore),
  app: AppKeystoreClient(axiosInstance),
  asset: AssetKeystoreClient(axiosInstance),
  blaze: BlazeKeystoreClient(keystore, config.blazeOptions),
  attachment: AttachmentKeystoreClient(axiosInstance),
  circle: CircleKeystoreClient(axiosInstance),
  code: CodeKeystoreClient(axiosInstance),
  collection: CollectibleKeystoreClient(axiosInstance, keystore),
  conversation: ConversationKeystoreClient(axiosInstance, keystore),
  external: ExternalKeystoreClient(axiosInstance),
  message: MessageKeystoreClient(axiosInstance, keystore),
  multisig: MultisigKeystoreClient(axiosInstance, keystore),
  network: NetworkBaseClient(axiosInstance),
  oauth: OAuthKeystoreClient(axiosInstance),
  pin: PinKeystoreClient(axiosInstance, keystore),
  transfer: TransferKeystoreClient(axiosInstance, keystore),
  user: UserKeystoreClient(axiosInstance),
  withdrawal: WithdrawalKeystoreClient(axiosInstance, keystore),
});

type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function MixinApi(config: HTTPConfig = {}): KeystoreClientReturnType & RequestClient {
  const axiosInstance = createAxiosClient(config);
  const requestClient = createRequestClient(axiosInstance);

  const { keystore } = config;
  const keystoreClient = KeystoreClient(axiosInstance, keystore, config);

  return merge(keystoreClient, requestClient);
}