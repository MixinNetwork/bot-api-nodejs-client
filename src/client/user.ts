import { AxiosInstance } from 'axios';
import { AuthenticationUserResponse, UserResponse, PreferenceRequest, RelationshipRequest, RelationshipAddRequest, LogRequest, LogResponse } from './types/user';
import { buildClient } from './utils/client';
import { AtLeastOne } from '../types';

/** Methods to obtain or edit users' profile and relationships */
export const UserKeystoreClient = (axiosInstance: AxiosInstance) => ({
  /** Get the current user's personal information */
  profile: () => axiosInstance.get<unknown, AuthenticationUserResponse>(`/me`),

  /** Get the contact list of the users, containing users and bots */
  friends: () => axiosInstance.get<unknown, UserResponse[]>(`/friends`),

  /** Get users' block list */
  blockings: () => axiosInstance.get<unknown, UserResponse[]>(`/blocking_users`),

  /** Rotate user's code */
  rotateCode: () => axiosInstance.get<unknown, AuthenticationUserResponse>('/me/code'),

  /** Search users by keyword */
  search: (identityNumberOrPhone: string) => axiosInstance.get<unknown, UserResponse>(`/search/${identityNumberOrPhone}`),

  /** Get user information by userID */
  fetch: (id: string) => axiosInstance.get<unknown, UserResponse>(`/users/${id}`),

  /**
   * Get users' information by userIDs in bulk
   * This API will only return the list of existing users
   */
  fetchList: (userIDs: string[]) => axiosInstance.post<unknown, UserResponse[]>(`/users/fetch`, userIDs),

  /** Create a network user, can be created by bot only with no permission */
  createBareUser: (fullName: string, sessionSecret: string) => axiosInstance.post<unknown, UserResponse>('/users', { full_name: fullName, session_secret: sessionSecret }),

  /** Modify current user's personal name and avatar */
  update: (fullName: string, avatarBase64: string) => axiosInstance.post<unknown, UserResponse>(`/me`, { full_name: fullName, avatar_base64: avatarBase64 }),

  /** update user's preferences */
  updatePreferences: (params: AtLeastOne<PreferenceRequest>) => axiosInstance.post<unknown, AuthenticationUserResponse>(`/me/preferences`, params),

  /** Manage the relationship between two users, one can 'ADD' | 'REMOVE' | 'BLOCK' | 'UNBLOCK' a user */
  updateRelationships: (relationship: RelationshipRequest | RelationshipAddRequest) => axiosInstance.post<unknown, UserResponse>(`/relationships`, relationship),

  /** Get pin logs of user */
  logs: (params: LogRequest) => axiosInstance.get<unknown, LogResponse[]>(`/logs`, { params }),
});

export const UserClient = buildClient(UserKeystoreClient);

export default UserClient;
