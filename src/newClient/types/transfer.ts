import { UserResponse } from './user';
import { AssetResponse } from './asset';

export interface Payment {
  recipient: UserResponse;
  asset: AssetResponse;
  asset_id: string;
  amount: string;
  trace_id: string;
  status: string;
  memo: string;
  receivers: string;
  threshold: string;
  code_id: string;
}

export interface TransferRequest {
  asset_id: string;
  opponent_id: string;
  amount?: string;
  trace_id?: string;
  memo?: string;

  pin?: string;
}

export interface WithdrawRequest {
  address_id: string;
  amount: string;
  trace_id?: string;

  memo?: string;
  pin?: string;
}