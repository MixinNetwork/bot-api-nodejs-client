interface BaseSnapshotResponse {
  snapshot_id: string;
  asset_id: string;
  amount: string;
  closing_balance: string;
  created_at: string;
  opening_balance: string;
  snapshot_at?: string;
  snapshot_hash?: string;
  transaction_hash: string;
  type: string;
}

export interface TransferResponse extends BaseSnapshotResponse {
  type: 'transfer';
  opponent_id: string;
  trace_id: string;
  memo: string;
}

export interface DepositResponse extends BaseSnapshotResponse {
  type: 'deposit';
  output_index: number;
  sender: string;
}

export interface RawTransactionResponse extends BaseSnapshotResponse {
  type: 'raw';
  opponent_key: string;
  opponent_receivers: string[];
  opponent_threshold: number;
  trace_id: string;
  memo: string;
  state: string;
}

export type SnapshotResponse = DepositResponse | TransferResponse | RawTransactionResponse;

export interface SnapshotRequest {
  limit: number;
  offset: string;
  order?: 'ASC' | 'DESC';
  asset?: string;
  opponent?: string;
  /** only for withdrawals */
  destination?: string;
  tag?: string;
}

export interface SafeSnapshotsRequest {
  app?: string;
  asset?: string;
  opponent?: string;
  offset?: string;
  limit?: number;
}
