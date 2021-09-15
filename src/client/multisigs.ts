import { SHA3 } from 'sha3'
import { AxiosInstance } from "axios"
import { getSignPIN } from "../mixin/sign"
import { BigNumber } from 'bignumber.js'
import {
  Keystore,
  MultisigClientRequest, MultisigRequest, MultisigUTXO,
  MultisigAction, TransactionInput, Transaction, GhostInput, GhostKeys,
} from "../types"

const TxVersion = 0x02
export class MultisigsClient implements MultisigClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  readMultisigs(offset: string, limit: number): Promise<MultisigUTXO[]> {
    return this.request.get(`/multisigs`, { params: { offset, limit } })
  }
  readMultisigOutputs(members: string[], threshold: number, offset: string, limit: number): Promise<MultisigUTXO[]> {
    if (members.length > 0 && threshold < 1 || threshold > members.length) return Promise.reject(new Error("Invalid threshold or members"))
    const params: any = { threshold: Number(threshold), offset, limit }
    params.members = hashMember(members)
    return this.request.get(`/multisigs/outputs`, { params })
  }
  createMultisig(action: MultisigAction, raw: string): Promise<MultisigRequest> {
    return this.request.post(`/multisigs`, { action, raw })
  }
  signMultisig(request_id: string, pin?: string): Promise<MultisigRequest> {
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/multisigs/${request_id}/sign`, { pin })
  }
  cancelMultisig(request_id: string): Promise<void> {
    return this.request.post(`/multisigs/${request_id}/cancel`)
  }
  unlockMultisig(request_id: string, pin: string): Promise<void> {
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/multisigs/${request_id}/unlock`, { pin })
  }
  batchReadGhostKeys(inputs: GhostInput[]): Promise<GhostKeys[]> {
    return this.request.post(`/outputs`, inputs)
  }
  async makeMultisignTransaction(txInput: TransactionInput): Promise<Transaction> {
    // validate ...
    let { inputs, memo, outputs } = txInput
    const tx: Transaction = {
      version: TxVersion,
      asset: newHash(inputs[0].asset_id),
      extra: memo,
      inputs: [],
      outputs: []
    }
    // add input
    for (const input of inputs) {
      tx.inputs!.push({
        hash: input.transaction_hash,
        index: input.output_index
      })
    }
    let change = inputs.reduce((sum, input) => sum.plus(input.amount), new BigNumber(0))
    for (const output of outputs) change = change.minus(output.amount)
    if (change.isGreaterThan(0)) outputs.push({ receivers: inputs[0].members, threshold: inputs[0].threshold, amount: change.toNumber() })
    const ghostInputs: GhostInput[] = []
    outputs.forEach((output, idx) => ghostInputs.push({ receivers: output.receivers, index: idx, hint: txInput.hint }))
    // get ghost keys
    let ghosts = await this.batchReadGhostKeys(ghostInputs)
    outputs.forEach((output, idx) => {
      const { mask, keys } = ghosts[idx]
      // TODO not check...
      tx.outputs!.push({ mask, keys, amount: output.amount | 0, })
    })
    return tx
  }
}

function hashMember(ids: string[]) {
  ids = ids.sort((a, b) => a > b ? 1 : -1)
  return newHash(ids.join(''))
}

function newHash(str: string) {
  return new SHA3(256).update(str).digest('hex')
}