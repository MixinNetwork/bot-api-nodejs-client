import { UserResponse } from './user';
import { AssetResponse } from './asset';
import { AddressResponse } from './address';

// todo remove?
// For 1to1 transfer
export interface PaymentResponse {
  recipient: UserResponse;
  asset: AssetResponse;
  address: AddressResponse;
  amount: string;
  status: string;
}

// For multisig transfer
export interface PaymentRequestResponse {
  type: 'payment';
  asset_id: string;
  amount: string;
  receivers: string[];
  threshold: number;
  memo: string;
  trace_id: string;
  created_at: string;
  status: string;
  code_id: string;
}
