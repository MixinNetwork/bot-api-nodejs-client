import { AxiosInstance } from 'axios'
import { request } from '../services/request'
import { ClientUserRequest } from './user'
import { UserClientRequest, User, UserRelationship, Keystore } from '../types'

export class Client implements UserClientRequest {
  request: AxiosInstance

  constructor(keystore?: Keystore, token?: string) {
    if (!keystore && !token) throw new Error('keystore or token required')
    this.request = request(keystore, token)
  }
  // User...
  userMe!: () => Promise<User>
  readUser!: (userIdOrIdentityNumber: string) => Promise<User>
  readUsers!: (userIDs: string[]) => Promise<User[]>
  searchUser!: (identityNumberOrPhone: string) => Promise<User>
  readFriends!: () => Promise<User[]>
  createUser!: () => Promise<User>
  modifyProfile!: (full_name: string, avatar_base64: string) => Promise<User>
  modifyRelationships!: (relationship: UserRelationship) => Promise<User>
  readBlockUsers!: () => Promise<User[]>

}
_extends(Client, ClientUserRequest)

function _extends(origin: any, target: any) {
  for (const key in target.prototype) {
    origin.prototype[key] = target.prototype[key]
  };
}