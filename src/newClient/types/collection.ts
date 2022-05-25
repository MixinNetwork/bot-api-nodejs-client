export type CollectibleOutputState = 'unspent' | 'signed' | 'spent';

export type CollectibleAction = 'sign' | 'unlock';

export type CollectibleRequestAction = 'sign' | 'unlock' | 'cancel';

export type CollectibleRequestState = 'initial' | 'signed';

export interface NFTResponse {
  type: 'non_fungible_token';
  token_id: string;
  group: string;
  token: string;
  mixin_id: string;
  collection_id: string;
  nfo: string;
  meta: NFTMetaResponse;
  receivers: string[];
  receivers_threshold: number;
  created_at: Date;
}

export interface NFTCollectionResponse {
  type: 'collection';
  collection_id: string;
  name: string;
  description: string;
  icon_url: string;
  created_at: Date;
}

export interface CollectibleOutputsRequest {
  state?:	CollectibleOutputState;
  offset?: string;
  limit?: number;
  members: string[];
  threshold: number;
}

export interface NFTOutputResponse {
  type: 'non_fungible_output';
  user_id: string;
  output_id: string;
  token_id: string;
  transaction_hash: string;
  output_index: number;
  amount: string;
  senders: string[];
  senders_threshold: number;
  receivers: string[];
  receivers_threshold: number;
  extra: string;
  state: string;
  created_at: Date;
  updated_at: Date;
  signed_by: string;
  signed_tx: string;
}

export interface CollectibleGenerateRequest {
  action: CollectibleAction;
  raw: string;
}

interface NFTMetaResponse {
  group: string;
  name: string;
  description: string;
  icon_url: string;
  media_url: string;
  mime: string;
  hash: string;
}

export interface NFTRequestResponse {
  type: '';
  request_id: string;
  user_id: string;
  token_id: string;
  amount: string;
  senders: string[];
  senders_threshold: number;
  receivers: string[];
  receivers_threshold: number;
  signers: string;
  action: string;
  state: string;
  transaction_hash: string;
  raw_transaction: string;
  created_at: Date;
  updated_at: Date;
  code_id: string;
}