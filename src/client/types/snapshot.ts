interface BaseSnapshotResponse {
  snapshot_id: string;
  asset_id: string;
  amount: string;
  closing_balance: string;
  created_at: Date;
  opening_balance: string;
  snapshot_at?: Date;
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

export interface WithdrawalResponse extends BaseSnapshotResponse {
  type: 'withdrawal' | 'rebate' | 'fee';
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

export interface RawTransactionResponse extends BaseSnapshotResponse {
  type: string;
  opponent_key: string;
  opponent_receivers: string[];
  opponent_threshold: number;
  trace_id: string;
  memo: string;
  state: string;
}

export type SnapshotResponse = DepositResponse | TransferResponse | WithdrawalResponse | WithdrawalWithFeeResponse | RawTransactionResponse;

export interface SnapshotRequest {
  limit: number | string;
  offset: string;
}