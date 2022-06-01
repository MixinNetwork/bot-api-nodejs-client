export interface DepositEntryResponse {
  destination: string;
  tag: string;
}

export interface AssetCommonResponse {
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
  reserve: string;
}

// fields for
// GET /assets/:id
// GET /network/assets/top
// GET /network/search/:q
export interface AssetResponse extends AssetCommonResponse {
  balance: string;
  deposit_entries: DepositEntryResponse[];
  destination: string;
  tag: string;
}