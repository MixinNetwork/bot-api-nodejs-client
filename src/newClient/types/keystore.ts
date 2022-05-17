export interface Keystore {
  user_id: string;
  session_id: string;
  private_key: string;
  pin: string;
  pin_token: string;
  client_secret: string;
  scope?: string;

  authorization_token: string;
  host: string;
}

export default Keystore;
