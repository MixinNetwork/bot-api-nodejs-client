export type Operation = 'ADD' | 'REMOVE' | 'BLOCK' | 'UNBLOCK';

export interface UserResponse {
  type: 'user';
  user_id: string;
  identity_number: string;
  /** If there is no `PHONE:READ` permission, it will always be empty string */
  phone: string;
  full_name: string;
  biography: string;
  avatar_url: string;
  relationship: string;
  mute_until: string;
  created_at: string;
  is_verified: boolean;
  is_scam: boolean;
}

export interface AuthenticationUserResponse extends UserResponse {
  session_id: string;
  pin_token: string;
  pin_token_base64: string;
  code_id: string;
  code_url: string;
  device_status: string;

  has_safe: boolean;
  has_pin: boolean;
  has_emergency_contact: boolean;
  receive_message_source: string;
  accept_conversation_source: string;
  accept_search_source: string;
  fiat_currency: string;
  transfer_notification_threshold: number;
  transfer_confirmation_threshold: number;

  public_key?: string;
  private_key?: string;
  tip_counter: number;
  tip_key_base64: string;
}

export interface PreferenceRequest {
  receive_message_source: string;
  accept_conversation_source: string;
  accept_search_source: string;
  fiat_currency: string;
  transfer_notification_threshold?: number;
  transfer_confirmation_threshold?: number;
}

export interface RelationshipRequest {
  user_id: string;
  action: Operation;
}

export interface RelationshipAddRequest extends RelationshipRequest {
  phone?: string;
  full_name?: string;
}

export interface LogRequest {
  category?: string;
  offset?: string;
  limit?: number;
}

export interface LogResponse {
  type: string;
  log_id: string;
  code: string;
  ip_address: string;
  created_at: string;
}
