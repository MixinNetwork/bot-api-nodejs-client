export interface Keystore {
  user_id: string;

  // oauth
  private_key?: string;
  scope?: string;
  authorization_id?: string;

  // owner
  session_id?: string;
  pin?: string;
  pin_token?: string;
  client_secret?: string;

  sign: 'oauth' | 'owner';
}

export default Keystore;
