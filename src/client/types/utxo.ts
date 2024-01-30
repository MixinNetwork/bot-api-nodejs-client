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

export interface SafeUtxoOutput extends UtxoOutput {
  receivers: string[];
  receivers_hash: string;
  receivers_threshold: number;
  senders: string[];
  senders_hash: string;
  senders_threshold: number;
  sequence: number;
}

export interface OutputsRequest {
  members: string[];
  threshold: number;
  state?: UtxoState;
  offset?: string;
  limit?: number;
  order?: 'ASC' | 'DESC';
}

export interface SafeOutputsRequest {
  asset?: string;
  members?: string[];
  threshold?: number;
  state?: UtxoState;
  offset?: string;
  limit?: number;
}

export interface SafeBalanceRequest extends SafeOutputsRequest {
  asset: string;
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

export interface SequencerTransactionRequest {
  type: 'kernel_transaction_request';
  request_id: string;
  transaction_hash: string;
  asset: string;
  amount: string;
  extra: string;
  user_id: string;
  state: string;
  raw_transaction: string;
  created_at: string;
  updated_at: string;
  snapshot_id: string;
  snapshot_hash: string;
  snapshot_at: string;
  receivers: string[];
  senders: string[];
  senders_hash: string;
  senders_threshold: number;
  signers: string[];
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

export interface PaymentParams {
  uuid?: string;
  mainnetAddress?: string;
  mixAddress?: string;
  members?: string[];
  threshold?: number;

  asset?: string;
  amount?: string;
  memo?: string;
  trace?: string;
  returnTo?: string;
}
