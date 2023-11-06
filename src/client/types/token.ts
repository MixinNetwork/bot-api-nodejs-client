// field for:
// GET safe/assets
// GET safe/assets/:id
// GET safe/assets/fetch
// GET network/assets/search/:query
// GET network/assets/top
export interface Token {
  type: 'token';
  asset_id: string;
  kernel_asset_id: string;
  symbol: string;
  name: string;
  icon_url: string;
  price_btc: string;
  price_usd: string;
  chain_id: string;
  change_usd: string;
  change_btc: string;
  confirmations: number;
  asset_key: string;
  dust: string;
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

export interface PendingDeposit {
  deposit_id: string;
  transaction_hash: string;
  amount: string;
  confirmations: number;
  threshold: number;
  created_at: string;
}
