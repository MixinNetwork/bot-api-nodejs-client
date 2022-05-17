import Keystore from './keystore';

export interface BaseClient<TokenReturnType, KeystoreReturnType> {
  (token: string): TokenReturnType;
  (keystore: Keystore): TokenReturnType & KeystoreReturnType;
}

export type PickFirstArg<F> = F extends (arg: infer P, ...args: any) => infer R ? (arg: P) => R : never;
