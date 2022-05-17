export interface Keystore {
  client_id: string;
  client_secret: string;
  session_id: string;
  private_key: string;
  pin_token: string;
  scope?: string;
  pin: string;
}

export interface BaseClient<TokenReturnType, KeystoreReturnType> {
  (token: string): TokenReturnType;
  (keystore: Keystore): TokenReturnType & KeystoreReturnType;
}

export type PickFirstArg<F> = F extends (arg: infer P, ...args: any) => infer R ? (arg: P) => R : never;
