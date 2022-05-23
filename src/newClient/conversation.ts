import { AxiosInstance } from 'axios';
import { uniqueConversationID } from './utils/uniq';
import { buildClient } from './utils/client';
import Keystore from './types/keystore';
import { ConversationResponse, ConversationAction, ConversationCreateRequest, ConversationUpdateRequest, Participant } from './types/conversation';

// Manage conversation, need keystore
export const ConversationKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const createConversation = (params: ConversationCreateRequest) => axiosInstance.post<unknown, ConversationResponse>('/conversations', params);

  const managerConversation = (conversationID: string, action: ConversationAction, participant: Participant[]) =>
    axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/participants/${action}`, participant);

  const createContactConversation = (userID: string): Promise<ConversationResponse> => createConversation({
      category: 'CONTACT',
      conversation_id: uniqueConversationID(keystore!.user_id, userID),
      participants: [{ user_id: userID }],
    });

  const muteConversation = (conversationID: string, duration: number): Promise<ConversationResponse> => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/mute`, { duration });

  return {
    // Ensure the conversation is created
    // when creating a new group or having a conversation with a user
    // for the first time.
    create: createConversation,

    // Create a conversation with a user for the first time
    createContact: createContactConversation,

    // Create a new group for the first time
    createGroup: (conversationID: string, name: string, participant: Participant[]) =>
      createConversation({
        category: 'GROUP',
        conversation_id: conversationID,
        name,
        participants: participant,
      }),

    // Add/remove other participants or add/remove admin in a group
    updateParticipants: managerConversation,

    // Add users, if you are the owner or admin of this group conversation
    addParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ADD',
        userIDs.map(userID => ({ user_id: userID })),
      ),

    // Remove users, if you are the owner or admin of this group conversation
    removeParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'REMOVE',
        userIDs.map(userID => ({ user_id: userID })),
      ),

    // Set admin privileges for a user, group owners Only
    setAdmin: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ROLE',
        userIDs.map(userID => ({ user_id: userID, role: 'ADMIN' })),
      ),

    // Remove admin privileges for a user, group owners Only
    revokeAdmin: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ROLE',
        userIDs.map(userID => ({ user_id: userID, role: '' })),
      ),

    // Update a group's title and announcement by conversationID
    updateGroupInfo: (conversationID: string, params: ConversationUpdateRequest) => axiosInstance.put<unknown, ConversationResponse>(`/conversations/${conversationID}`, params),

    // Reset invitation link and codeId
    resetGroupCode: (conversationID: string) => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/rotate`),

    // Join a group by codeID
    joinGroup: (codeId: string) => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${codeId}/join`),

    // Exit a group
    exitGroup: (conversationID: string) => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/exit`),

    // Mute contact for <duration> seconds
    mute: (conversationID: string, duration: number) => muteConversation(conversationID, duration),

    // Unmute contact
    unmute: (conversationID: string) => muteConversation(conversationID, 0),
  };
};

export const ConversationClient = buildClient(ConversationKeystoreClient);

export default ConversationClient;