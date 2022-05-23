export interface DepositEntry {
  destination: string;
  tag: string;
}

export interface AssetResponse {
  type: 'asset';
  asset_id: string;
  chain_id: string;
  symbol: string;
  name: string;
  icon_url: string;
  price_btc: string;
  change_btc: string;
  price_usd: string;
  change_usd: string;
  asset_key: string;
  mixin_id: string;
  confirmations: number;
  capitalization: number;
  liquidity: string;

  // fields for
  // GET /assets/:id
  // GET /network/assets/top
  // GET /network/search/:q
  balance: string;
  deposit_entries: DepositEntry[];
  destination: string;
  tag: string;
  reserve: string;

  // for GET /network/assets/:id only
  amount: string;
  fee: string;
  snapshots_count: number;
}

export interface AssetNetworkResponse {
}

export interface ExchangeRate {
  code: string;
  rate: string;
}
