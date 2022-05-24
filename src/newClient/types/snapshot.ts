import { RawTransactionResponse } from './transaction';

export interface DepositResponse {
  type: 'deposit';
  snapshot_id: string;
  asset_id: string;
  transaction_hash: string;
  output_index: number;
  sender: string;
  amount: string;
  opening_balance: string;
  closing_balance: string;
  snapshot_hash?: string;
  snapshot_at?: Date;
  created_at: Date;
}

export interface TransferResponse {
  type: 'transfer';
  snapshot_id: string;
  opponent_id: string;
  asset_id: string;
  amount: string;
  opening_balance: string;
  closing_balance: string;
  trace_id: string;
  memo: string;
  created_at: Date;
  transaction_hash?: string;
  snapshot_hash?: string;
  snapshot_at?: string;
}

export interface WithdrawalResponse {
  type: 'withdrawal' | 'rebate' | 'fee';
  snapshot_id: string;
  receiver: string;
  transaction_hash: string;
  asset_id: string;
  amount: string;
  opening_balance: string;
  closing_balance: string;
  confirmations: number;
  trace_id: string;
  memo: string;
  snapshot_hash?: string;
  snapshot_at?: Date;
  created_at: string;
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
  order: 'ASC' | 'DESC'
}
