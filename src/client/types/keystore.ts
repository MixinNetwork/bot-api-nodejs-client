/** Credentials used to sign requests, including before a session is issued. */
export interface SessionKeystore {
  app_id: string;
  session_private_key: string;
  session_id?: string;
}

export interface AppKeystore extends SessionKeystore {
  session_id: string;
  server_public_key: string;
  spend_private_key?: string;
}

export interface OAuthKeystore {
  app_id: string;
  scope: string;
  authorization_id: string;
  session_private_key: string;
}

export interface NetworkUserKeystore extends SessionKeystore {
  session_id: string;
  pin_token_base64: string;
}

export type Keystore = SessionKeystore | AppKeystore | OAuthKeystore | NetworkUserKeystore;

export default Keystore;
