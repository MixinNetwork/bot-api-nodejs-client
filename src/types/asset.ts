export interface Asset {
  asset_id: string
  chain_id: string
  asset_key?: string
  mixin_id?: string
  symbol: string
  name: string
  icon_url: string
  price_btc: string
  change_btc: string
  price_usd: string
  change_usd: string
  balance: string
  destination: string
  tag: string
  confirmations: number
  capitalization: number
}