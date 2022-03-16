import { TransactionInput, InvokeCodeParams } from "../types"
import { v4 as newUUID, parse } from 'uuid'
import { Encoder } from "../mixin/encoder"
import { base64url } from "../mixin/sign"
import { utils } from "ethers"
import { JsonFragment } from "@ethersproject/abi"

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


export const getMvmTransaction = (params: InvokeCodeParams): TransactionInput => {
  return {
    asset_id: params.asset,
    amount: params.amount,
    trace_id: params.trace || newUUID(),
    opponent_multisig: {
      receivers: members,
      threshold
    },
    memo: encodeMemo(params.extra, params.process),
  }
}

export const abiParamsGenerator = (contractAddress: string, abi: JsonFragment[]): { [method: string]: Function } => {
  const res: { [method: string]: Function } = {}
  if (contractAddress.startsWith('0x')) contractAddress = contractAddress.slice(2)
  abi.forEach(item => {
    if (item.type === 'function') {
      const params = item.inputs?.map(v => v.type!) || []
      const methodID = getMethodIdByAbi(item, params)
      res[item.name!] = function () {
        if (arguments.length != params.length) throw new Error('params length error')
        const abiCoder = new utils.AbiCoder()
        return (contractAddress + methodID + abiCoder.encode(params, Array.from(arguments)).slice(2)).toLowerCase()
      }
    }
  })
  return res
}

export const extraGeneratByInfo = (contractAddress: string, methodName: string, types?: string[], values?: any[]): string => {
  if (contractAddress.startsWith('0x')) contractAddress = contractAddress.slice(2)
  if (!types || !values) return (contractAddress + utils.id(methodName + '()').slice(2, 10)).toLowerCase()
  if (types.length != values.length) throw new Error('params length error')
  const methodId = utils.id(methodName + '(' + types.join(',') + ')').slice(2, 10)
  const abiCoder = new utils.AbiCoder()
  return (contractAddress + methodId + abiCoder.encode(types, values).slice(2)).toLowerCase()
}

function getMethodIdByAbi(abi: JsonFragment, params: string[]): string {
  let res = abi.name + '('
  res += (params.join(',') || '') + ')'
  return utils.id(res).slice(2, 10)
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