export interface DepositEntryResponse {
  destination: string;
  tag?: string;
  properties?: string[];
}

export interface AssetCommonResponse {
  type: 'asset';
  asset_id: string;
  chain_id: string;
  fee_asset_id: string;
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
  precision: number;
  withdrawal_memo_possibility: 'negative' | 'positive' | 'possible';
}

// fields for
// GET /assets/:id
// GET /network/assets/top
// GET /network/search/:q
// GET /network/assets/:id
// GET /safe/assets/:id
export interface AssetResponse extends AssetCommonResponse {
  balance: string;
  deposit_entries: DepositEntryResponse[];
  /**
   * @Deprecated use deposit_entries
   */
  destination: string;
  tag: string;
}
