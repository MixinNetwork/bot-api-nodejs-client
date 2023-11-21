export type UtxoState = 'unspent' | 'signed' | 'spent';

export interface UtxoOutput {
  utxo_id: string;
  transaction_hash: string;
  output_index: number;
  asset: string;
  amount: string;
  mask: string;
  keys: string[];
  threshold: number;
  extra: string;
  state: UtxoState;
  created_at: string;
  updated_at: string;
  signed_by: string;
  signed_at: string;
  spent_at: string;
}

export interface OutputsRequest {
  members: string[];
  threshold: number;
  state?: UtxoState;
  offset?: string;
  limit?: number;
  order?: 'ASC' | 'DESC';
}

export interface SafeOutputsRequest extends OutputsRequest {
  asset?: string;
}

export interface GhostKey {
  mask: string;
  keys: string[];
}

export interface GhostKeyRequest {
  receivers: string[];
  index: number;
  hint: string;
}

export interface TransactionResponse {
  type: string;
  request_id: string;
  user_id: string;
  transaction_hash: string;
  asset: string;
  senders_hash: string;
  senders_threshold: number;
  senders: string[];
  signers: string[];
  extra: string;
  state: string;
  raw_transaction: string;
  created_at: string;
  updated_at: string;
  snapshot_hash: string;
  snapshot_at: string;
  views: string[];
}

export interface TransactionRequest {
  raw: string;
  request_id: string;
}

export interface OutputFetchRequest {
  user_id: string;
  ids: string[];
}
