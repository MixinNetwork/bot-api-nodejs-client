export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export type MessageCategory =
  | 'PLAIN_TEXT'
  | 'PLAIN_AUDIO'
  | 'PLAIN_POST'
  | 'PLAIN_IMAGE'
  | 'PLAIN_DATA'
  | 'PLAIN_STICKER'
  | 'PLAIN_LIVE'
  | 'PLAIN_LOCATION'
  | 'PLAIN_VIDEO'
  | 'PLAIN_CONTACT'
  | 'APP_CARD'
  | 'APP_BUTTON_GROUP'
  | 'MESSAGE_RECALL'
  | 'SYSTEM_CONVERSATION'
  | 'SYSTEM_ACCOUNT_SNAPSHOT';

export type EncryptedMessageStatus = 'SUCCESS' | 'FAILED';

export interface AcknowledgementResponse {
  message_id: string;
  status: MessageStatus;
}

export interface AcknowledgementRequest {
  message_id: string;
  status: string;
}

export interface MessageView {
  type: 'message';
  representative_id: string;
  quote_message_id: string;
  conversation_id: string;
  user_id: string;
  session_id: string;
  message_id: string;
  category: MessageCategory;
  data: string;
  data_base64: string;
  status: MessageStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRequest {
  conversation_id: string;
  message_id: string;
  category: MessageCategory;
  data: string;
  recipient_id?: string;
  representative_id?: string;
  quote_message_id?: string;
}

export interface StickerMessageRequest {
  sticker_id: string;
  name?: string;
  album_id?: string;
}

export interface ImageMessageRequest {
  attachment_id: string;
  mime_type: string;
  width: number;
  height: number;
  size: number;
  thumbnail?: string;
}

export interface AudioMessageRequest {
  attachment_id: string;
  mime_type: string;
  size: number;
  duration: number;
  wave_form?: string;
}

export interface VideoMessageRequest {
  attachment_id: string;
  mime_type: string;
  width: number;
  height: number;
  size: number;
  duration: number;
  thumbnail?: string;
}

export interface ContactMessageRequest {
  user_id: string;
}

export interface AppCardMessageRequest {
  app_id: string;
  icon_url: string;
  title: string;
  description: string;
  action: string;
  shareable?: boolean;
}

export interface FileMessageRequest {
  attachment_id: string;
  mime_type: string;
  size: number;
  name: string;
}

export interface LiveMessageRequest {
  width: number;
  height: number;
  thumb_url: string;
  url: string;
  shareable?: boolean;
}

export interface LocationMessageRequest {
  longitude: number;
  latitude: number;
  address?: string;
  name?: string;
}

export interface AppButtonMessageRequest {
  label: string;
  action: string;
  color: string;
}

export interface TransferMessageRequest {
  type: string;
  snapshot_id: string;
  opponent_id: string;
  asset_id: string;
  amount: number;
  trace_id: string;
  memo: string;
  created_at: string;
}

export interface RecallMessageRequest {
  message_id: string;
}

export interface EncryptedMessageResponse {
  type: 'message';
  message_id: string;
  recipient_id: string;
  state: EncryptedMessageStatus;
}
