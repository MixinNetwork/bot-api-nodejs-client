import { MessageCategory, MessageStatus } from "../client/types/message";

export type MessageType = MessageView | TransferView | SystemConversationPayload;

export interface TransferData {
  type: 'transaction',
  snapshot_id: string;
  transaction_hash: string;
  user_id: string;
  opponent_id: string;
  asset_id: string;
  amount: string;
  memo: string;
  created_at: string;
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
  data: string | TransferData;
  data_base64: string;
  status: MessageStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface TransferView {
  type: 'transfer';
  snapshot_id: string;
  counter_user_id: string;
  asset_id: string;
  amount: string;
  trace_id: string;
  memo: string;
  created_at: string;
}

export interface SystemConversationPayload {
  action: string;
  participant_id: string;
  user_id?: string;
  role?: string;
}

export interface BlazeOptions {
  /** whether to parse message */
  parse?: boolean;
  /** whether to sync ack */
  syncAck?: boolean;
}

export interface BlazeHandler {
  onMessage: (message: MessageView) => void | Promise<void>;
  onAckReceipt?: (message: MessageView) => void | Promise<void>;
  onTransfer?: (transfer: MessageView) => void | Promise<void>;
  onConversation?: (conversation: MessageView) => void | Promise<void>;
}

export interface BlazeMessage {
  id: string;
  action: string;
  params?: { [key: string]: any };
  data?: MessageType;
}
