import { AppResponse } from './app';

export type OAuthScope = 'PROFILE:READ' | 'ASSETS:READ' | 'PHONE:READ' | 'CONTACTS:READ' | 'MESSAGES:REPRESENT' | 'SNAPSHOTS:READ' | 'CIRCLES:READ' | 'CIRCLES:WRITE';

export interface AccessTokenResponse {
  scope: string;
  authorization_id: string;
  /** public key from server */
  ed25519: string;
}
export interface AccessTokenRequest {
  client_id: string;
  code: string;
  ed25519: string;
  client_secret?: string;
  code_verifier?: string;
}

export interface AuthorizeRequest {
  authorization_id: string;
  scopes: OAuthScope[];
  pin_base64?: string;
}

export interface AuthorizationResponse {
  type: 'authorization';
  authorization_id: string;
  authorization_code: string;
  scopes: OAuthScope[];
  code_id: string;
  app: Omit<AppResponse, 'type'>;
  created_at: string;
  accessed_at: string;
}
