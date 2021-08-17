import { Asset } from './asset'
export interface Snapshot {
  snapshot_id: string
  created_at: string
  trace_id: string
  user_id: string
  asset_id: string
  chain_id: string
  opponent_id: string
  source: string
  amount: string
  opening_balance: string
  closing_balance: string
  memo: string
  type: string
  sender: string
  receiver: string
  transaction_hash: string

  asset?: Asset
  data?: string
}

