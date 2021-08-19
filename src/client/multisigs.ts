import { AxiosInstance } from "axios";
import { getSignPIN } from "../mixin/sign";
import { Keystore } from "../types";
import { MultisigClientRequest, MultisigRequest, MultisigUTXO } from "../types/multisigs";

export class MultisigsClient implements MultisigClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  readMultisigs(offset: string, limit: number): Promise<MultisigUTXO[]> {
    return this.request.get(`/multisigs`, { params: { offset, limit } })
  }
  readMultisigOutputs(members: string[], threshold: number, offset: string, limit: number): Promise<MultisigUTXO[]> {
    if (members.length > 0 && threshold < 1 || threshold > members.length) return Promise.reject(new Error("Invalid threshold or members"))
    //TODO...

    return this.request.get(`/multisigs/outputs`, { params: { members, threshold, offset, limit } })
  }
  createMultisig(action: string, raw: string): Promise<MultisigRequest> {
    return this.request.post(`/multisigs`, { action, raw })
  }
  signMultisig(request_id: string, pin?: string): Promise<MultisigRequest> {
    if (!pin) pin = this.keystore.pin
    if (!pin) return Promise.reject(new Error("PIN required"))
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/multisigs/${request_id}/sign`, { pin })
  }
  cancelMultisig(request_id: string): Promise<void> {
    return this.request.post(`/multisigs/${request_id}/cancel`)
  }
  unlockMultisig(request_id: string, pin: string): Promise<void> {
    if (!pin) pin = this.keystore.pin
    if (!pin) return Promise.reject(new Error("PIN required"))
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/multisigs/${request_id}/unlock`, { pin })
  }
}