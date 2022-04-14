import { TransactionInput } from "./transaction"
import { JsonFragment } from "@ethersproject/abi"


export interface InvokeCodeParams {
  asset: string
  amount: string
  extra: string
  trace: string
  process?: string
}

export interface ExtraGeneratOptions {
  uploadkey?: string // auto upload params
  delegatecall?: boolean // use delegatecall
  process?: string // registry process
  address?: string // registry address
}

export interface ExtraGeneratParams {
  contractAddress: string
  methodName?: string
  types?: string[]
  values?: any[]
  options?: ExtraGeneratOptions
  methodID?: string
}


export interface MvmClientRequest {
  getMvmTransaction(params: InvokeCodeParams): TransactionInput
  abiParamsGenerator(contractAddress: string, abi: JsonFragment[]): { [method: string]: Function }
  extraGeneratorByInfo(params: ExtraGeneratParams, options: ExtraGeneratOptions): string
}