export interface RawTransactionRequest {
  asset_id: string;
  amount?: string;
  trace_id?: string;
  memo?: string;
  // OpponentKey used for raw transaction
  opponent_key?: string;
  opponent_multisig?: {
    receivers: string[];
    threshold: number;
  };

  pin?: string;
}

export interface RawTransactionResponse {
  type: string;
  snapshot: string;
  opponent_key: string;
  opponent_receivers: string[];
  opponent_threshold: number;
  asset_id: string;
  amount: string;
  opening_balance: string;
  closing_balance: string;
  trace_id: string;
  memo: string;
  state: string;
  created_at: Date;
  transaction_hash: string;
  snapshot_hash: string;
  snapshot_at: Date;
}

export interface GhostInput {
  receivers: string[];
  index: number;
  hint: string;
}

export interface GhostKeys {
  keys: string[];
  mask: string;
}
