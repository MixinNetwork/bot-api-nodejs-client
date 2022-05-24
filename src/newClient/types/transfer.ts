import { UserResponse } from './user';
import { AssetResponse } from './asset';
import { AddressResponse } from './address';

// For multisig transfer
export interface PaymentRequestResponse {
  type: 'payment';
  asset_id: string;
  amount: string;
  receivers: string[];
  threshold: number;
  memo: string;
  trace_id: string;
  created_at: Date;
  status: string;
  code_id: string;
}

// For 1to1 transfer
export interface PaymentResponse {
  recipient: UserResponse;
  asset: AssetResponse;
  address: AddressResponse;
  amount: string;
  status: string;
}

export interface TransferRequest {
  asset_id: string;
  opponent_id: string;
  amount: string;
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