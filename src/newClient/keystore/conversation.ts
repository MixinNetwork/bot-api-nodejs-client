import { AxiosInstance } from 'axios';
import { Conversation, Keystore } from 'types';
import { uniqueConversationID } from 'utils';
import { ConversationClient as ConversationClientWithToken } from '../token/conversation';

export function ConversationClient(keystore: Keystore, axiosInstance: AxiosInstance) {
  const c = ConversationClientWithToken(axiosInstance);

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
}
