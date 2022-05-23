export interface CircleConversationResponse {
  type: 'circle_conversation';
  circle_id: string;
  conversation_id: string;
  user_id: string;
  created_at: Date;
}

export interface CircleResponse {
  circle_id: string;
  conversation_id: string;
  created_at: Date;
}

export interface CircleFilterResponse {
  limit: number;
  offset: string;
}