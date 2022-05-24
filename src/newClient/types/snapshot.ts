import { AssetResponse } from './asset';

export interface SnapshotResponse {
  type: string;
  snapshot_id: string;
  trace_id: string;
  user_id?: string;
  asset_id: string;
  created_at: string;
  opponent_id?: string;
  source: string;
  amount: string;
  memo: string;
  chain_id?: string;
  opening_balance?: string;
  closing_balance?: string;
  sender?: string;
  receiver?: string;
  transaction_hash?: string;

  asset?: AssetResponse;
  data?: string;
  fee?: {
    amount: string;
    asset_id: string;
  };
}

export interface SnapshotRequest {
  limit: number | string;
  offset: string;

  asset?: string;
  opponent?: string;
  tag?: string;
  destination?: string; // query external transactions
  order: 'ASC' | 'DESC'
}