import { AxiosInstance } from 'axios'

export class ClientUserRequest implements UserClientRequest {
  request!: AxiosInstance
  userMe(): Promise<User> {
    return this.request.get(`/me`)
  }
  readUser(userIdOrIdentityNumber: string): Promise<User> {
    return this.request.get(`/users/${userIdOrIdentityNumber}`)
  }
  readBlockUsers(): Promise<User[]> {
    return this.request.get(`/blocking_users`)
  }
  readUsers(userIDs: string[]): Promise<User[]> {
    return this.request.post(`/users/fetch`, userIDs)
  }
  readFriends(): Promise<User[]> {
    return this.request.get(`/friends`)
  }
  searchUser(identityNumberOrPhone: string): Promise<User> {
    return this.request.get(`/search/${identityNumberOrPhone}`)
  }
  createUser(): Promise<User> {
    // TODO
    return this.request.get(`/users`)
  }
  modifyProfile(full_name: string, avatar_base64: string): Promise<User> {
    return this.request.post(`/me`, { full_name, avatar_base64 })
  }
  modifyRelationships(relationship: UserRelationship): Promise<User> {
    return this.request.post(`/relationships`, relationship)
  }
}