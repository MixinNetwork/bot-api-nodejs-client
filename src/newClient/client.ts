import { request } from 'services/request';
import { Keystore } from 'types';
import { KeystoreClient } from './keystore/client';
import { TokenClient } from './token/client';

type TokenClient = ReturnType<typeof TokenClient>;
type KeystoreClient = TokenClient & ReturnType<typeof KeystoreClient>;

export function Client(token: string): TokenClient;
export function Client(keystore: Keystore): KeystoreClient;
export function Client(arg: string | Keystore): any {
  const r = request(arg);

  const tokenClient = TokenClient(r);

  if (typeof arg === 'string') {
    return tokenClient;
  }

  return Object.assign(tokenClient, KeystoreClient(arg, r));
}
