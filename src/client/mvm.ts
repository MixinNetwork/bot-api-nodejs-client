import { TransactionInput, MvmClientRequest, Payment, InvokeCodeParams } from "../types"
import { v4 as newUUID, parse } from 'uuid'
import { Encoder } from "../mixin/encoder"
import { base64url } from "../mixin/sign"

// const OperationPurposeUnknown = 0
const OperationPurposeGroupEvent = 1
// const OperationPurposeAddProcess = 11
// const OperationPurposeCreditProcess = 12

const members = [
  "a15e0b6d-76ed-4443-b83f-ade9eca2681a",
  "b9126674-b07d-49b6-bf4f-48d965b2242b",
  "15141fe4-1cfd-40f8-9819-71e453054639",
  "3e72ca0c-1bab-49ad-aa0a-4d8471d375e7"
]

const RegistryProcess = "60e17d47-fa70-3f3f-984d-716313fe838a"

const threshold = 3


export class MvmClient implements MvmClientRequest {
  verifyPayment!: (params: TransactionInput) => Promise<Payment>;
  async getInvokeCode(params: InvokeCodeParams): Promise<Payment> {
    const input: TransactionInput = {
      asset_id: params.asset,
      amount: params.amount,
      trace_id: params.trace || newUUID(),
      opponent_multisig: {
        receivers: members,
        threshold
      },
      memo: encodeMemo(params.extra, params.process),
    }
    return this.verifyPayment(input)
  }
}

const encodeMemo = (extra: string, process?: string): string => {
  const enc = new Encoder(Buffer.from([]))
  enc.writeInt(OperationPurposeGroupEvent)
  enc.write(parse(process || RegistryProcess) as Buffer)
  enc.writeBytes(Buffer.from([]))
  enc.writeBytes(Buffer.from([]))
  enc.writeBytes(Buffer.from(extra, 'hex'))
  return base64url(enc.buf)
}