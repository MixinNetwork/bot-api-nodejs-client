// field for:
// GET safe/assets
// GET safe/assets/:id
// GET safe/assets/fetch
export interface SafeAsset {
  type: 'safe_asset';
  asset_id: string;
  chain_id: string;
  symbol: string;
  name: string;
  icon_url: string;
  price_btc: string;
  price_usd: string;
  change_btc: string;
  change_usd: string;
  asset_key: string;
  precision: number;
  dust: string;
  confirmations: number;
  kernel_asset_id: string;
  price_updated_at: string;
}

export interface SafeDepositEntriesRequest {
  members: string[];
  threshold: number;
  chain_id: string;
}

export interface SafeDepositEntryResponse {
  type: 'deposit_entry';
  entry_id: string;
  chain_id: string;
  members: string[];
  threshold: number;
  destination: string;
  tag: string;
  signature: string;
  is_primary: boolean;
}

export interface SafePendingDepositRequest {
  asset: string;
  destination?: string;
  tag?: string;
  offset?: string;
  limit?: number;
}

export interface SafePendingDepositResponse {
  deposit_id: string;
  transaction_hash: string;
  amount: string;
  confirmations: number;
  threshold: number;
  created_at: string;
}

export interface SafeSnapshot {
  snapshot_id: string;
  type: string;
  asset_id: string;
  amount: string;
  user_id: string;
  opponent_id: string;
  memo: string;
  transaction_hash: string;
  created_at: string;
  trace_id: string | null;
  confirmations: number | null;
  opening_balance: string | null;
  closing_balance: string | null;
  deposit: SafeDeposit | null;
  withdrawal: SafeWithdrawal | null;
}

export interface SafeDeposit {
  deposit_hash: string;
}

export interface SafeWithdrawal {
  withdrawal_hash: string;
  receiver: string;
}

export interface SafeWithdrawalRecipient {
  amount: string;
  destination: string;
  tag?: string;
}

export interface SafeMixinRecipient {
  members: string[];
  threshold: number;
  mixAddress: string;
  amount: string;
}

export type SafeTransactionRecipient = SafeWithdrawalRecipient | SafeMixinRecipient;

export interface SafeWithdrawalFee {
  type: 'withdrawal_fee';
  amount: string;
  asset_id: string;
}
