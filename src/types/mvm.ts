import { TransactionInput } from "./transaction"
import { JsonFragment } from "@ethersproject/abi"


export interface InvokeCodeParams {
  asset: string
  amount: string
  extra: string
  trace: string
  process?: string
}

export interface MvmClientRequest {
  getMvmTransaction(params: InvokeCodeParams): TransactionInput
  abiParamsGenerator(contractAddress: string, abi: JsonFragment[]): { [method: string]: Function }
  extraGeneratorByInfo(contractAddress: string, methodName: string, types?: string[], values?: any[]): string
}