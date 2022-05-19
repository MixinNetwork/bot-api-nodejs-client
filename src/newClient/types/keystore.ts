export interface Keystore {
  user_id: string;
  session_id: string;
  private_key: string;
  pin: string;
  pin_token: string;
  client_secret: string;
  scope?: string;
}

export default Keystore;
