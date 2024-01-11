import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { ConversationRequest, ConversationResponse, ConversationAction, ParticipantRequest } from './types/conversation';
import { uniqueConversationID } from './utils/uniq';
import { buildClient } from './utils/client';

/**
 * Create and manage a conversation
 * Notes:
 * * only owner and admin can add or remove participants, and rotate conversation code
 * * only owner can change the role of participants
 * * only owner and admin can setup disappear
 * * for group conversation, creator will be the owner and can't be changed.
 * Docs: https://developers.mixin.one/docs/api/conversations/read
 */
export const ConversationKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  const createConversation = (params: ConversationRequest): Promise<ConversationResponse> => axiosInstance.post<unknown, ConversationResponse>('/conversations', params);

  const managerConversation = (conversationID: string, action: ConversationAction, participant: ParticipantRequest[]): Promise<ConversationResponse> =>
    axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/participants/${action}`, participant);

  const createContactConversation = (userID: string): Promise<ConversationResponse> => {
    if (!keystore) throw new Error('No Keystore Provided');
    return createConversation({
      category: 'CONTACT',
      conversation_id: uniqueConversationID(keystore.app_id, userID),
      participants: [{ user_id: userID }],
    });
  };

  const muteConversation = (conversationID: string, duration: number): Promise<ConversationResponse> =>
    axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/mute`, { duration });

  return {
    /** Get specific conversation information by conversationID */
    fetch: (conversationID: string): Promise<ConversationResponse> => axiosInstance.get<unknown, ConversationResponse>(`/conversations/${conversationID}`),

    /**
     * Ensure the conversation is created
     * when creating a new group or having a conversation with a user
     * for the first time.
     */
    create: createConversation,

    /** Create a conversation with a user for the first time */
    createContact: createContactConversation,

    /** Create a new group for the first time */
    createGroup: (conversationID: string, name: string, participant: ParticipantRequest[]) =>
      createConversation({
        category: 'GROUP',
        conversation_id: conversationID,
        name,
        participants: participant,
      }),

    /** Join a group by codeID */
    joinGroup: (codeID: string): Promise<ConversationResponse> => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${codeID}/join`),

    /** Exit a group */
    exitGroup: (conversationID: string): Promise<ConversationResponse> => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/exit`),

    /** Add/remove other participants or add/remove admin in a group */
    updateParticipants: managerConversation,

    /** Add users, if you are the owner or admin of this group conversation */
    addParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ADD',
        userIDs.map(userID => ({ user_id: userID })),
      ),

    /** Remove users, if you are the owner or admin of this group conversation */
    removeParticipants: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'REMOVE',
        userIDs.map(userID => ({ user_id: userID })),
      ),

    /** Set admin privileges for a user, group owners Only */
    setAdmin: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ROLE',
        userIDs.map(userID => ({ user_id: userID, role: 'ADMIN' })),
      ),

    /** Remove admin privileges for a user, group owners Only */
    revokeAdmin: (conversationID: string, userIDs: string[]) =>
      managerConversation(
        conversationID,
        'ROLE',
        userIDs.map(userID => ({ user_id: userID, role: '' })),
      ),

    /** Reset invitation link and codeId */
    resetGroupCode: (conversationID: string): Promise<ConversationResponse> => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/rotate`),

    /** Update a group's title and announcement by conversationID */
    updateGroupInfo: (conversationID: string, params: Pick<ConversationRequest, 'name' | 'announcement'>): Promise<ConversationResponse> =>
      axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}`, params),

    /** Mute contact for <duration> seconds */
    mute: (conversationID: string, duration: number) => muteConversation(conversationID, duration),

    /** Unmute contact */
    unmute: (conversationID: string) => muteConversation(conversationID, 0),

    /** Set the disappearing message expiration duration for group */
    disappearDuration: (conversationID: string, duration: number) => axiosInstance.post<unknown, ConversationResponse>(`/conversations/${conversationID}/disappear`, { duration }),
  };
};

export const ConversationClient = buildClient(ConversationKeystoreClient);

export default ConversationClient;
