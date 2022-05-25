import { RawTransactionResponse } from './transaction';

interface BaseSnapshotResponse {
  amount: string;
  asset_id: string;
  closing_balance: string;
  created_at: Date;
  opening_balance: string;
  snapshot_at?: Date;
  snapshot_hash?: string;
  transaction_hash: string;
  type: string;
}
export interface DepositResponse extends BaseSnapshotResponse {
  type: 'deposit';
  snapshot_id: string;
  output_index: number;
  sender: string;
}

export interface TransferResponse extends BaseSnapshotResponse {
  type: 'transfer';
  snapshot_id: string;
  opponent_id: string;
  trace_id: string;
  memo: string;
}

export interface WithdrawalResponse extends BaseSnapshotResponse {
  type: 'withdrawal' | 'rebate' | 'fee';
  snapshot_id: string;
  receiver: string;
  confirmations: number;
  trace_id: string;
  memo: string;
}

interface FeeResponse {
  Amount: string;
  asset_id: string;
}

export interface WithdrawalWithFeeResponse extends WithdrawalResponse {
  type: 'fee';
  state: string;
  fee: FeeResponse;
}

export type SnapshotResponse = DepositResponse | TransferResponse | WithdrawalResponse | WithdrawalWithFeeResponse | RawTransactionResponse;

export interface SnapshotRequest {
  limit: number | string;
  offset: string;
}

export interface SnapshotFilterRequest {
  limit?: number | string;
  offset?: string;
  asset?: string;
  opponent?: string;
  tag?: string;
  destination?: string; // query external transactions
  order: 'ASC' | 'DESC';
}
