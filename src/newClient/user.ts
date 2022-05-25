import { AxiosInstance } from 'axios';
import { RelationshipRequest, PreferenceRequest, AuthenticationUserResponse, UserResponse } from './types/user';
import { buildClient } from './utils/client';

// Methods to obtain or edit users' profile and relationships
export const UserKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get the current user's personal information
  profile: () => axiosInstance.get<unknown, AuthenticationUserResponse>(`/me`),

  // Get user information by userID
  // This API will only return the list of existing users
  fetch: (id: string) => axiosInstance.get<unknown, UserResponse>(`/users/${id}`),

  // Get users' information by userIDs in bulk
  fetchList: (userIDs: string[]) => axiosInstance.post<unknown, UserResponse[]>(`/users/fetch`, userIDs),

  // Get users' block list
  blockings: () => axiosInstance.get<unknown, UserResponse[]>(`/blocking_users`),

  // Get the contact list of the users, containing users and bots
  friends: () => axiosInstance.get<unknown, UserResponse[]>(`/friends`),

  // Search users by keyword
  search: (identityNumberOrPhone: string) => axiosInstance.get<unknown, UserResponse>(`/search/${identityNumberOrPhone}`),

  // Rotate user's code
  rotateCode: () => axiosInstance.get<unknown, AuthenticationUserResponse>('/me/code'),

  // Create a network user, can be created by bot only with no permission
  createBareUser: (fullName: string, sessionSecret: string) => axiosInstance.post<UserResponse>('/users', { full_name: fullName, session_secret: sessionSecret }),

  // Modify current user's personal name and avatar
  update: (fullName: string, avatarBase64: string) => axiosInstance.post<unknown, UserResponse>(`/me`, { full_name: fullName, avatar_base64: avatarBase64 }),

  // Manage the relationship between two users, one can 'ADD' | 'REMOVE' | 'BLOCK' | 'UNBLOCK' a user
  updateRelationships: (relationship: RelationshipRequest) => axiosInstance.post<unknown, UserResponse>(`/relationships`, relationship),

  // update user's preferences
  updatePreferences: (params: PreferenceRequest) => axiosInstance.post<unknown, AuthenticationUserResponse>(`/me/preferences`, params),
});

export const UserClient = buildClient(UserKeystoreClient);

export default UserClient;
