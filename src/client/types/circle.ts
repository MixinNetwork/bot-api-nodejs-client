export interface CircleResponse {
  type: 'circle';
  circle_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface CircleRequest {
  offset: string;
  limit: number;
}

export interface CircleConversationResponse {
  type: 'circle_conversation';
  circle_id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
}
