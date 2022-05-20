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
  asset_id: string;
  amount: string;
  trace_id: string;
  memo: string;
  state: string;
  created_at: string;
  transaction_hash: string;
  snapshot_hash: string;
  snapshot_at: string;
}