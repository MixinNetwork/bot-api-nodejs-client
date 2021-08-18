import { AxiosInstance } from 'axios'
import { request } from '../services/request'
import { UserClient } from './user'
import { AddressClient } from './address'
import {
  UserClientRequest, User, UserRelationship, Keystore,
  AddressClientRequest, AddressCreateParams, Address
} from '../types'

export class Client implements
  UserClientRequest,
  AddressClientRequest {
  request: AxiosInstance
  keystore: Keystore

  constructor(keystore?: Keystore, token?: string) {
    if (!keystore && !token) throw new Error('keystore or token required')
    this.keystore = keystore!
    this.request = request(keystore, token)
  }
  // User...
  userMe!: () => Promise<User>
  readUser!: (userIdOrIdentityNumber: string) => Promise<User>
  readUsers!: (userIDs: string[]) => Promise<User[]>
  searchUser!: (identityNumberOrPhone: string) => Promise<User>
  readFriends!: () => Promise<User[]>
  createUser!: (full_name: string, session_secret?: string) => Promise<User>
  modifyProfile!: (full_name?: string, avatar_base64?: string) => Promise<User>
  modifyRelationships!: (relationship: UserRelationship) => Promise<User>
  readBlockUsers!: () => Promise<User[]>


  // Address...
  createAddress!: (params: AddressCreateParams, pin?: string) => Promise<Address>
  readAddress!: (address_id: string) => Promise<Address>
  readAddresses!: (asset_id: string) => Promise<Address[]>
  deleteAddress!: (address_id: string, pin?: string) => Promise<void>

}
_extends(Client, UserClient)
_extends(Client, AddressClient)

function _extends(origin: any, target: any) {
  for (const key in target.prototype) {
    origin.prototype[key] = target.prototype[key]
  };
}