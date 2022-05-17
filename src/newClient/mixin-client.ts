import merge from 'lodash.merge';
import { PinKeystoreClient } from './pin';
import { UserTokenClient } from './user';
import Keystore from './types/keystore';

const TokenClient = (keystore: Keystore) => ({
  user: UserTokenClient(keystore),
});

const KeystoreClient = (keystore: Keystore) => ({
  pin: PinKeystoreClient(keystore),
});

type TokenClientReturnType = ReturnType<typeof TokenClient>;
type KeystoreClientReturnType = ReturnType<typeof KeystoreClient>;

export function Client(keystore: Keystore): TokenClientReturnType & KeystoreClientReturnType;
export function Client(keystore: Keystore) {
  const tokenClient = TokenClient(keystore);

  const keystoreClient = KeystoreClient(keystore);
  return merge(tokenClient, keystoreClient);
}
