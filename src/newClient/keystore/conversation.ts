import { AxiosInstance } from 'axios';
import { Keystore } from 'types';
import { uniqueConversationID } from 'utils';
import { ConversationClient as ConversationClientWithToken } from '../token/conversation';

export function ConversationClient(keystore: Keystore, axiosInstance: AxiosInstance) {
  const c = ConversationClientWithToken(axiosInstance);
  return {
    createContactConversation: async (userID: string) => {
      return c.createConversation({
        category: 'CONTACT',
        conversation_id: uniqueConversationID(keystore.client_id, userID),
        participants: [{ user_id: userID }],
      });
    },
  };
}
