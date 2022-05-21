export interface CircleConversationResponse {
  type: 'circle_conversation';
  circle_id: string;
  conversation_id: string;
  user_id: string;
  created_at: Date;
}
