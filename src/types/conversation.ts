
interface Conversation {
  conversation_id: string
  creator_id: string
  category: string
  name: string
  icon_url: string
  announcement: string
  created_at: string
  code_id: string
  code_url: string

  participants: Participant[]
}

type ConversationCategory = "CONTACT" | "GROUP"
type ConversationAction = "CREATE" | "ADD" | "REMOVE" | "JOIN" | "EXIT" | "ROLE"
type ConversationRole = "OWNER" | "ADMIN" | ""

interface Participant {
  user_id: string
  type?: "participant"
  role?: ConversationRole
  created_at?: string
}

interface ConversationCreateParmas {
  category: ConversationCategory
  name: string
  conversation_id: string
  participants: Participant[]
}

interface ConversationUpdateParams {
  name?: string
  announcement?: string
}

interface ConversationClientRequest {
  createConversation(params: ConversationCreateParmas): Promise<Conversation>
  updateConversation(conversationID: string, params: ConversationUpdateParams): Promise<Conversation>
  createContactConversation(userID: string): Promise<Conversation>
  createGroupConversation(conversationID: string, name: string, participant: Participant[]): Promise<Conversation>
  readConversation(conversationID: string): Promise<Conversation>
  managerConversation(conversationID: string, action: ConversationAction, participant: Participant[]): Promise<Conversation>
  rotateConversation(conversationID: string): Promise<Conversation>
}
