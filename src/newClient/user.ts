import { AxiosInstance } from 'axios';
import { pki } from 'node-forge';
import { request } from '../services/request';
import { BaseClient } from './types/client';
import { AuthenticationUserResponse, UserResponse, RelationshipRequest } from './types/user';

// Methods to manage user's information
export const UserTokenClient = (axiosInstance: AxiosInstance) => {
  async function create(fullName: string): Promise<AuthenticationUserResponse>;
  async function create(fullName: string, sessionSecret: string): Promise<AuthenticationUserResponse>;
  async function create(fullName: string, sessionSecret?: string) {
    if (sessionSecret) {
      return axiosInstance.post('/users', { full_name: fullName, session_secret: sessionSecret });
    }
    // todo export to utils?
    const { publicKey, privateKey } = pki.ed25519.generateKeyPair();
    const params = {
      full_name: fullName,
      session_secret: Buffer.from(publicKey).toString('base64'),
    };
    const user = await axiosInstance.post<unknown, AuthenticationUserResponse>('/users', params);
    user.public_key = publicKey.toString('base64');
    user.private_key = privateKey.toString('base64');
    return user;
  }
  return {
    // Get the current user's personal information
    profile: () => axiosInstance.get<unknown, AuthenticationUserResponse>(`/me`),

    // Getting user information by userID or identity_number
    show: (userIdOrIdentityNumber: string) => axiosInstance.get<unknown, AuthenticationUserResponse | undefined>(`/users/${userIdOrIdentityNumber}`),

    // Getting users' block list
    blockingUsers: () => axiosInstance.get<unknown, UserResponse[]>(`/blocking_users`),

    // Getting users' information by user IDs in bulk
    showUsers: (userIDs: string[]) => axiosInstance.post<unknown, UserResponse[]>(`/users/fetch`, userIDs),

    // Obtaining the contact list of the users, containing users and bots
    friends: () => axiosInstance.get<unknown, UserResponse[]>(`/friends`),

    // Search users by keyword
    search: (identityNumberOrPhone: string) => axiosInstance.get<unknown, UserResponse | undefined>(`/search/${identityNumberOrPhone}`),

    // Create a network user
    create,

    // Modify current user's personal name and avatar
    update: (fullName: string, avatarBase64: string) => axiosInstance.post<unknown, UserResponse>(`/me`, { full_name: fullName, avatar_base64: avatarBase64 }),

    // Manage the relationship between two users
    updateRelationships: (relationship: RelationshipRequest) => axiosInstance.post<unknown, UserResponse>(`/relationships`, relationship),
  };
};

export const UserClient: BaseClient<ReturnType<typeof UserTokenClient>, ReturnType<typeof UserTokenClient>> = (arg: any): any => UserTokenClient(request(arg));
