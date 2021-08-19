import { AxiosInstance } from "axios";
import { getSignPIN } from "../mixin/sign";
import { Keystore, Snapshot } from "../types";
import { GhostInput, GhostKeys, Payment, RawTransaction, TransferClientRequest, TransferInput, WithdrawInput } from "../types/transfer";


export class TransferClient implements TransferClientRequest {
  keystore!: Keystore
  request!: AxiosInstance

  verifyPayment(params: TransferInput): Promise<Payment> {
    return this.request.post("/payments", params)
  }
  transfer(params: TransferInput, pin?: string): Promise<Snapshot> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post("/transfers", params)
  }
  readTransfer(trace_id: string): Promise<Snapshot> {
    return this.request.get(`/transfers/trace/${trace_id}`)
  }
  transaction(params: TransferInput, pin?: string): Promise<RawTransaction> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post("/transactions", params)
  }
  readGhostKeys(receivers: string[], index: number): Promise<GhostKeys> {
    return this.request.post("/outputs", { receivers, index, hint: "" })
  }
  batchReadGhostKeys(input: GhostInput[]): Promise<GhostKeys[]> {
    return this.request.post("/outputs", input)
  }
  withdraw(params: WithdrawInput, pin?: string): Promise<Snapshot> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post("/withdrawals", params)
  }
}
