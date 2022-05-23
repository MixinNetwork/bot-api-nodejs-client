export type CollectibleOutputState = 'unspent' | 'signed' | 'spent';

export type CollectibleAction = 'sign' | 'unlock';

export type CollectibleRequestAction = 'sign' | 'unlock' | 'cancel';

export type CollectibleRequestState = 'initial' | 'signed';

export interface CollectibleGenerateRequest {
  action: CollectibleAction;
  raw: string;
}

export interface CollectibleOutputsRequest {
  state?:	CollectibleOutputState;
  offset?: string;
  limit?: number;
  members: string[];
  threshold: number;
}

export interface CollectibleOutputResponse {
  type?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  output_id?: string;
  token_id?: string;
  transaction_hash?: string;
  output_index?: number;
  amount?: string;
  senders?: string[];
  senders_threshold?: number;
  receivers?: string[];
  receivers_threshold?: number;
  state?: string;
  signed_by?: string;
  signed_tx?: string;
}

export interface CollectibleResponse {
  type?: string;
  created_at?: string;
  updated_at?: string;
  request_id?: string;
  user_id?: string;
  token_id?: string;
  amount?: string;
  senders?: string[];
  senders_threshold?: number;
  receivers?: string[];
  receivers_threshold?: number;
  signers?: string;
  action?: string;
  state?: string;
  transaction_hash?: string;
  raw_transaction?: string;
}

export interface CollectibleTokenMeta {
  group?: string;
  name?: string;
  description?: string;
  icon_url?: string;
  media_url?: string;
  mime?: string;
  hash?: string;
}
export interface CollectibleTokenResponse {
  type?: string;
  created_at?: string;
  token_id?: string;
  group?: string;
  token?: string;
  mixin_id?: string;
  nfo?: string;
  meta?: CollectibleTokenMeta;
}

export interface CollectibleCollectionResponse {
  type?: string;
  collection_id?: string;
  name: string,
  description: string,
  icon_url: string,
  created_at: string,
}