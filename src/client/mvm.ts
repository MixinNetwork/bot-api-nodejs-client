import { TransactionInput, InvokeCodeParams } from "../types"
import { v4 as newUUID, parse, stringify } from 'uuid'
import { Encoder } from "../mixin/encoder"
import { base64url } from "../mixin/sign"
import { ethers, utils } from "ethers"
import { JsonFragment } from "@ethersproject/abi"
import { registryAbi, registryAddress, registryProcess } from "../mixin/mvm_registry"

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

const threshold = 3


// 获取 mvm 的交易输入
export const getMvmTransaction = (params: InvokeCodeParams): TransactionInput => {
  return {
    asset_id: params.asset,
    amount: params.amount,
    trace_id: params.trace || newUUID(),
    opponent_multisig: {
      receivers: members,
      threshold
    },
    memo: encodeMemo(params.extra, params.process || registryProcess),
  }
}

// 根据 abi 获取 extra
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

// 根据调用信息获取 extra
export const extraGeneratByInfo = (contractAddress: string, methodName: string, types?: string[], values?: any[]): string => {
  if (contractAddress.startsWith('0x')) contractAddress = contractAddress.slice(2)
  if (!types || !values) return (contractAddress + utils.id(methodName + '()').slice(2, 10)).toLowerCase()
  if (types.length != values.length) throw new Error('params length error')
  const methodId = utils.id(methodName + '(' + types.join(',') + ')').slice(2, 10)
  const abiCoder = new utils.AbiCoder()
  return (contractAddress + methodId + abiCoder.encode(types, values).slice(2)).toLowerCase()
}

export const getContractByAssetID = (id: string): Promise<string> =>
  getRegistryContract().contracts('0x' + Buffer.from(parse(id) as Buffer).toString('hex'))


export const getContractByUserIDs = (ids: string | string[], threshold?: number): Promise<string> => {
  if (typeof ids === 'string') ids = [ids]
  if (!threshold) threshold = ids.length
  const encoder = new Encoder(Buffer.from([]))
  encoder.writeInt(ids.length)
  ids.forEach(id => encoder.writeUUID(id))
  encoder.writeInt(threshold)
  return getRegistryContract().contracts(utils.keccak256('0x' + encoder.buf.toString('hex')))
}

export const getAssetIDByAddress = async (contract_address: string): Promise<string> => {
  const registry = getRegistryContract()
  let res = await registry.assets(contract_address)
  if (res.isZero()) return ""
  res = res._hex.slice(2)
  return stringify(Buffer.from(res, 'hex'))
}

export const getUserIDByAddress = async (contract_address: string): Promise<string> => {
  const registry = getRegistryContract()
  let res = await registry.users(contract_address)
  if (res.isZero()) return ""
  res = res._hex.slice(2)
  return stringify(Buffer.from(res, 'hex'))
}

const getRegistryContract = () =>
  new ethers.Contract(registryAddress, registryAbi, new ethers.providers.JsonRpcProvider('https://quorum-testnet.mixin.zone/'))



function getMethodIdByAbi(abi: JsonFragment, params: string[]): string {
  let res = abi.name + '('
  res += (params.join(',') || '') + ')'
  return utils.id(res).slice(2, 10)
}

const encodeMemo = (extra: string, process: string): string => {
  const enc = new Encoder(Buffer.from([]))
  enc.writeInt(OperationPurposeGroupEvent)
  enc.writeUUID(process)
  enc.writeBytes(Buffer.from([]))
  enc.writeBytes(Buffer.from([]))
  enc.writeBytes(Buffer.from(extra, 'hex'))
  return base64url(enc.buf)
}