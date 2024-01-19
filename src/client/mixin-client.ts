import merge from 'lodash.merge';
import type { AxiosInstance } from 'axios';
import type Keystore from './types/keystore';
import type { HTTPConfig, RequestClient } from './types';
import { createAxiosClient, createRequestClient } from './utils';
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
import { OAuthBaseClient } from './oauth';
import { PaymentBaseClient } from './payment';
import { PinKeystoreClient } from './pin';
import { TransferKeystoreClient } from './transfer';
import { UserKeystoreClient } from './user';
import { BlazeKeystoreClient } from './blaze';
import { UtxoKeystoreClient } from './utxo';
import { SafeKeystoreClient } from './safe';

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
  oauth: OAuthBaseClient(axiosInstance),
  payment: PaymentBaseClient(axiosInstance),
  pin: PinKeystoreClient(axiosInstance, keystore),
  safe: SafeKeystoreClient(axiosInstance, keystore),
  transfer: TransferKeystoreClient(axiosInstance, keystore),
  user: UserKeystoreClient(axiosInstance),
  utxo: UtxoKeystoreClient(axiosInstance),
});

export type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function MixinApi(config: HTTPConfig = {}): KeystoreClientReturnType & RequestClient {
  const { keystore, requestConfig } = config;

  const axiosInstance = createAxiosClient(keystore, requestConfig);
  const requestClient = createRequestClient(axiosInstance);

  const keystoreClient = KeystoreClient(axiosInstance, keystore, config);

  return merge(keystoreClient, requestClient);
}
