import { Payment } from "./transfer"


export interface InvokeCodeParams {
  asset: string
  amount: string
  extra: string
  trace: string
  process?: string
}

export interface MvmClientRequest {
  getInvokeCode(params: InvokeCodeParams): Promise<Payment>
}