import { AxiosInstance } from 'axios';
import { pki } from 'node-forge';
import { User, UserRelationship } from 'types';

export function UserClient(axiosInstance: AxiosInstance) {
  async function createUser(fullName: string): Promise<User>;
  async function createUser(fullName: string, sessionSecret: string): Promise<User>;
  async function createUser(fullName: string, sessionSecret?: string) {
    if (sessionSecret) {
      return axiosInstance.post('/users', { full_name: fullName, session_secret: sessionSecret });
    }
    // todo export to utils?
    const { publicKey, privateKey } = pki.ed25519.generateKeyPair();
    const params = {
      full_name: fullName,
      session_secret: Buffer.from(publicKey).toString('base64'),
    };
    const user = await axiosInstance.post<unknown, User>('/users', params);
    user.public_key = publicKey.toString('base64');
    user.private_key = privateKey.toString('base64');
    return user;
  }
  return {
    userMe: () => axiosInstance.get<unknown, User>(`/me`),

    readUser: (userIdOrIdentityNumber: string) => axiosInstance.get<unknown, User>(`/users/${userIdOrIdentityNumber}`),

    readBlockUsers: () => axiosInstance.get<unknown, User[]>(`/blocking_users`),

    readUsers: (userIDs: string[]) => axiosInstance.post<unknown, User[]>(`/users/fetch`, userIDs),

    readFriends: () => axiosInstance.get<unknown, User[]>(`/friends`),

    searchUser: (identityNumberOrPhone: string) => axiosInstance.get<unknown, User>(`/search/${identityNumberOrPhone}`),

    createUser,

    modifyProfile: (fullName: string, avatarBase64: string) => axiosInstance.post<unknown, User>(`/me`, { full_name: fullName, avatar_base64: avatarBase64 }),

    modifyRelationships: (relationship: UserRelationship) => axiosInstance.post<unknown, User>(`/relationships`, relationship),
  };
}
