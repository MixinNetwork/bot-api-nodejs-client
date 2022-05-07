import { TransactionInput } from "./transaction"
import { JsonFragment } from "@ethersproject/abi"


export interface InvokeCodeParams {
  asset: string
  amount: string
  extra: string
  trace: string
  process?: string
}

interface ContractParams {
  contractAddress: string
  methodName?: string
  types?: string[]
  values?: any[]
  methodID?: string
}

export interface ExtraGeneratParams extends ContractParams {
  options: {
    delegatecall?: boolean // use delegatecall
    process?: string // registry process
    address?: string // registry address
    uploadkey?: string // auto upload params

    ignoreUpload?: boolean // ignore upload params
  }
}

export interface PaymentGeneratParams extends ExtraGeneratParams {
  extra?: string,
  payment: {
    asset?: string
    amount?: string
    trace?: string
    type?: 'payment' | 'tx' // payment or tx, default is payment
  }
}


export interface MvmClientRequest {
  getMvmTransaction(params: InvokeCodeParams): TransactionInput
  abiParamsGenerator(contractAddress: string, abi: JsonFragment[]): { [method: string]: Function }
  extraGeneratByInfo(params: ExtraGeneratParams): string
  paymentGeneratByInfo(params: PaymentGeneratParams): string
}