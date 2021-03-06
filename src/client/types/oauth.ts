export type OAuthScope = 'PROFILE:READ' | 'ASSETS:READ' | 'PHONE:READ' | 'CONTACTS:READ' | 'MESSAGES:REPRESENT' | 'SNAPSHOTS:READ' | 'CIRCLES:READ' | 'CIRCLES:WRITE';

export interface AccessTokenResponse {
  scope: string;
  authorization_id: string;
  /** public key from server */
  ed25519: string;
}
