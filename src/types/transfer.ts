import { User } from './user'
import { Asset } from './asset'
import { Snapshot } from './snapshot'
export interface Payment {
  recipient: User
  asset: Asset
  asset_id: string
  amount: string
  trace_id: string
  status: string
  memo: string
  receivers: string
  threshold: string
  code_id: string
}

export interface Transfer {
}

export interface RawTransaction {
  type: string
  snapshot: string
  opponent_key: string
  asset_id: string
  amount: string
  trace_id: string
  memo: string
  state: string
  created_at: string
  transaction_hash: string
  snapshot_hash: string
  snapshot_at: string
}


export interface TransferInput {
  asset_id: string
  opponent_id?: string
  amount?: string
  trace_id?: string
  memo?: string

  // OpponentKey used for raw transaction
  opponent_key?: string
  opponent_multisig?: {
    receivers: string[]
    threshold: number
  }
}

export interface GhostKeys {
  mask: string
  keys: string[]
}

export interface GhostInput {
  receivers: string[]
  index: number
  hint: string
}


export interface WithdrawInput {
  asset_id: string
  amount: string
  trace_id?: string
  memo?: string
}

export interface TransferClientResponse {
  VerifyPayment(): Promise<Payment>
  Transfer(params: TransferInput, pin?: string): Promise<Snapshot>
  ReadTransfer(trace_id: string): Promise<Snapshot>
  Transaction(params: TransferInput, pin?: string): Promise<RawTransaction>
  ReadGhostKeys(receivers: string[], index: number): Promise<GhostKeys>
  BatchReadGhostKeys(input: GhostInput[]): Promise<GhostKeys[]>
  Withdraw(params: WithdrawInput, pin?: string): Promise<Snapshot>
}