import { MultisigUTXO } from '.'



export interface MintData {
  group: string
  batch: bigint
  amount: number
}

export interface DepositData {
  chain: string
  asset: string
  transaction: string
  index: bigint
  amount: number
}

export interface WithdrawData {
  chain: string
  asset: string
  address: string
  tag: string
}

export interface Input {
  hash?: string
  index?: number
  genesis?: string
  deposit?: DepositData
  mint?: MintData
}

export interface Output {
  type?: number
  amount?: number
  keys?: string[]
  withdrawal?: WithdrawData
  script?: number[]
  mask?: string
}

export interface AggregatedSignature {
  signers: number[]
  signature: string
}
export interface Transaction {
  hash?: string
  snapshot?: string
  signatures?: {
    [key: number]: string
  }
  aggregated_signature?: {
    signers: number[]
    signature: string
  }

  version?: number
  asset: string
  inputs?: Input[]
  outputs?: Output[]
  extra: string
}

export interface TransactionInput {
  memo: string
  inputs: MultisigUTXO[]
  outputs: TransactionOutput[]
  hint: string
}


export interface TransactionOutput {
  receivers: string[]
  threshold: number
  amount: number
}

export interface GhostInput {
  receivers: string[]
  index: number
  hint: string
}

export interface GhostKeys {
  keys: string[]
  mask: string
}