import { AssetCommonResponse } from './asset';

export interface NetworkInfoResponse {
  assets: NetworkAssetResponse[];
  chains: NetworkChainResponse[];
  assets_count: string;
  peak_throughput: string;
  snapshots_count: string;
  type: string;
}

export interface NetworkChainResponse {
  type: 'chain';
  chain_id: string;
  name: string;
  symbol: string;
  icon_url: string;
  managed_block_height: string;
  deposit_block_height: string;
  external_block_height: string;
  threshold: number;
  withdrawal_timestamp: string;
  withdrawal_pending_count: string;
  withdrawal_fee: string;
  is_synchronized: string;
}

// for GET /network/assets/:id only
export interface NetworkAssetResponse extends AssetCommonResponse {
  amount: string;
  fee: string;
  snapshots_count: number;
}

export interface NetworkPriceResponse {
  type: string;
  price_btc: number;
  price_usd: number;
}

export interface NetworkSnapshotAsset {
  asset_id: string;
  chain_id: string;
  icon_url: string;
  name: string;
  symbol: string;
  type: string;
}

export interface NetworkSnapshotResponse {
  amount: number;
  asset: NetworkSnapshotAsset;
  created_at: Date;
  snapshot_id: string;
  source: string;
  type: string; // Options only for user (or App) who has access.

  // 4 private fields that only be returned with correct permission
  user_id?: string;
  trace_id?: string;
  opponent_id?: string;
  data?: string;
}

export interface ExternalTransactionResponse {
  transaction_id: string;
  created_at: Date;
  transaction_hash: string;
  sender: string;
  chain_id: string;
  asset_id: string;
  amount: string;
  destination: string;
  tag: string;
  confirmations: string;
  threshold: string;
}

export interface ExchangeRateResponse {
  code: string;
  rate: string;
}

export interface CheckAddressResponse {
  destination: string;
  tag: string;
}

export interface CheckAddressRequest {
  asset: string;
  destination: string;
  tag?: string;
}

export interface NetworkSnapshotRequest {
  limit: number | string;
  offset: string;
  asset?: string;
  order?:string
}

export interface DepositFilterRequest {
  limit: number | string;
  offset: string;
  asset?: string;
  opponent?: string;
  tag?: string;
}

export interface SnapshotFilterRequest {
  limit: number | string;
  offset: string;
  asset?: string;
  order?: string;
}