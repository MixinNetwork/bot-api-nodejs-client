export interface CircleConversationResponse {
  type: 'circle_conversation';
  circle_id: string;
  conversation_id: string;
  user_id: string;
  created_at: Date;
}

export interface CircleResponse {
  type: 'circle';
  circle_id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

export interface CircleRequest {
  offset: Date;
  limit: number;
}
