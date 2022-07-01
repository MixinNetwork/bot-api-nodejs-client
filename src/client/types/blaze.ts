import { MessageView } from './message';

export type MessageType = MessageView | TransferView | SystemConversationPayload;

interface TransferView {
  type: 'transfer';
  snapshot_id: string;
  counter_user_id: string;
  asset_id: string;
  amount: string;
  trace_id: string;
  memo: string;
  created_at: string;
}

interface SystemConversationPayload {
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
  onMessage: (message: MessageView) => void;
  onAckReceipt?: (message: MessageView) => void;
  onTransfer?: (transfer: MessageView) => void;
  onConversation?: (conversation: MessageView) => void;
}

export interface BlazeMessage {
  id: string;
  action: string;
  params?: { [key: string]: any };
  data?: MessageType;
}