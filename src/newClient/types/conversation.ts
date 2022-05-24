import { CircleConversationResponse } from './circle';

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
  created_at: Date;

  code_id: string;
  code_url: string;
  mute_until: string;
  expire_in: number;

  participant_sessions: ParticipantResponse[];
  circles: CircleConversationResponse[];
}

export type ConversationCategory = 'CONTACT' | 'GROUP';
export type ConversationAction = 'ADD' | 'REMOVE' | 'ROLE';
export type ConversationRole = 'ADMIN' | '';

export interface Participant {
  user_id: string;
  role?: ConversationRole;
  created_at?: string;
}

export interface ConversationCreateRequest {
  category: ConversationCategory;
  conversation_id: string;
  participants: Participant[];
  name?: string;
}

export interface ConversationUpdateRequest {
  name?: string;
  announcement?: string;
}
