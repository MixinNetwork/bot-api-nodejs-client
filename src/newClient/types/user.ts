export interface UserResponse {
  type: 'user';
  user_id: string;
  identity_number: string;
  phone: string; // need `PHONE:READ` permission granted
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
}

export type Operation = 'ADD' | 'REMOVE' | 'BLOCK' | 'UNBLOCK';

export interface RelationshipRequest {
  user_id: string;
  action: Operation;
  phone?: string; // for ADD only
  full_name?: string; // for ADD only
}

export interface PreferenceRequest {
  receive_message_source: string;
  accept_conversation_source: string;
  accept_search_source: string;
  fiat_currency: string;
  transfer_notification_threshold?: number;
  transfer_confirmation_threshold?: number;
}
