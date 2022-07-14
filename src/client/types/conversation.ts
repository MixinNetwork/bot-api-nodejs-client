import { CircleConversationResponse } from './circle';

type ConversationCategory = 'CONTACT' | 'GROUP';
type ConversationRole = 'ADMIN' | '';
export type ConversationAction = 'ADD' | 'REMOVE' | 'ROLE';

export interface ParticipantResponse {
  type: 'participant';
  user_id: string;
  session_id: string;
  public_key: string;
}

export interface ConversationResponse {
  type: 'conversation';
  conversation_id: string;
  creator_id: string;
  category: ConversationCategory;
  name: string;
  icon_url: string;
  announcement: string;
  created_at: string;

  code_id: string;
  code_url: string;
  mute_until: string;
  expire_in: number;

  participant_sessions: ParticipantResponse[];
  circles: CircleConversationResponse[];
}

export interface ParticipantRequest {
  user_id: string;
  role?: ConversationRole;
}

export interface ConversationRequest {
  category: ConversationCategory;
  conversation_id: string;
  participants: ParticipantRequest[];
  name?: string;
  announcement?: string;
}
