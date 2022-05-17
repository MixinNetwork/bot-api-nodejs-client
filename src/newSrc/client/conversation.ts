import { AxiosInstance } from 'axios';
import { Conversation, ConversationAction, ConversationCreateParams, ConversationUpdateParams, Keystore, Participant } from 'types';
import { uniqueConversationID } from '../../utils';
import { UserTokenClient } from './user';
import { buildClient } from '../utils/build-client';

export const ConversationTokenClient = (axiosInstance: AxiosInstance) => {
  const userClient = UserTokenClient(axiosInstance);

  const createConversation = (params: ConversationCreateParams) => axiosInstance.post<unknown, Conversation>('/conversations', params);

  const managerConversation = (conversationID: string, action: ConversationAction, participant: Participant[]) =>
    axiosInstance.post<unknown, Conversation>(`/conversations/${conversationID}/participants/${action}`, participant);

  async function createContactConversation(userID: string): Promise<Conversation>;
  async function createContactConversation(userID: string, selfUserID: string): Promise<Conversation>;
  async function createContactConversation(userID: string, selfUserID?: string): Promise<any> {
    return createConversation({
      category: 'CONTACT',
      conversation_id: uniqueConversationID(selfUserID || (await userClient.profile()).user_id, userID),
      participants: [{ user_id: userID }],
    });
  }

  return {
    createConversation,

    updateConversation: (conversationID: string, params: ConversationUpdateParams) => axiosInstance.put<unknown, Conversation>(`/conversations/${conversationID}`, params),

    createContactConversation,

    createGroupConversation: (conversationID: string, name: string, participant: Participant[]) =>
      createConversation({
        category: 'GROUP',
        conversation_id: conversationID,
        name,
        participants: participant,
      }),

    readConversation: (conversationID: string) => axiosInstance.get<unknown, Conversation>(`/conversations/${conversationID}`),

    managerConversation,

    addParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ADD',
        userIDs.map(userID => ({ user_id: userID })),
      ),

    removeParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'REMOVE',
        userIDs.map(userID => ({ user_id: userID })),
      ),

    adminParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ROLE',
        userIDs.map(userID => ({ user_id: userID, role: 'ADMIN' })),
      ),

    rotateConversation: (conversationID: string) => axiosInstance.post<unknown, Conversation>(`/conversations/${conversationID}/rotate`),
  };
};

export const ConversationKeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => {
  const c = ConversationTokenClient(axiosInstance);

  async function createContactConversation(userID: string): Promise<Conversation>;
  async function createContactConversation(userID: string, selfUserID: string): Promise<Conversation>;
  async function createContactConversation(userID: string, selfUserID?: string): Promise<any> {
    return c.createConversation({
      category: 'CONTACT',
      conversation_id: uniqueConversationID(selfUserID || keystore.client_id, userID),
      participants: [{ user_id: userID }],
    });
  }

  return {
    createContactConversation,
  };
};

export const ConversationClient = buildClient(ConversationTokenClient, ConversationKeystoreClient);
