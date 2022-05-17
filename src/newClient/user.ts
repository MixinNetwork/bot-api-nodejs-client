import { RelationshipRequest } from './types/user';
import Keystore from './types/keystore';
import HTTP from './http';

// Methods to manage user's information
export const UserTokenClient = (keystore: Keystore) => {
  const http = new HTTP(keystore);

  return {
    // Get the current user's personal information
    profile: () => http.request('GET', `/me`),

    // Getting some user information by userID or identity_number
    user: (id: string) => http.request('GET', `/users/${id}`),

    // Getting users' information by user IDs in bulk
    users: (userIDs: string[]) => http.request('POST', `/users/fetch`, userIDs),

    // Getting users' block list
    blockingUsers: () => http.request('GET', `/blocking_users`),

    // Obtaining the contact list of the users, containing users and bots
    friends: () => http.request('GET', `/friends`),

    // Search users by keyword, identity can be mixin id, phone number or user id
    search: (identity: string) => http.request('GET', `/search/${identity}`),

    // Create a network user
    createBareUser: (fullName: string, sessionSecret: string) => http.request('POST', '/users', { full_name: fullName, session_secret: sessionSecret}),

    // Modify current user's personal name and avatar
    update: (fullName: string, avatarBase64: string) => http.request('POST', `/me`, { full_name: fullName, avatar_base64: avatarBase64 }),

    // Manage the relationship between two users
    updateRelationships: (relationship: RelationshipRequest) => http.request('POST', `/relationships`, relationship),
  };
};
