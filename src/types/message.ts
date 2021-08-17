
type MessageCategory = "PLAIN_TEXT" |
  "PLAIN_POST" |
  "PLAIN_IMAGE" |
  "PLAIN_DATA" |
  "PLAIN_STICKER" |
  "PLAIN_LIVE" |
  "PLAIN_VIDEO" |
  "PLAIN_CONTACT" |
  "APP_CARD" |
  "APP_BUTTON_GROUP" |
  "MESSAGE_RECALL" |
  "SYSTEM_CONVERSATION" |
  "SYSTEM_ACCOUNT_SNAPSHOT"


type MessageStatus = "SENT" | "DELIVER" | "READ"

interface RecallMessage {
  message_id: string
}

interface ImageMessage {
  attachment_id: string
  mime_type: string
  width: number
  height: number
  size: number
  thumbnail: string
}

interface DataMessage {
  attachment_id: string
  mime_type: string
  size: number
  name: string
}

interface StickerMessage {
  name: string
  album_id: string
}

interface ContactMesage {
  user_id: string
}

interface AppCardMessage {
  app_id: string
  icon_url: string
  title: string
  description: string
  action: string
}

interface AudioMessage {
  attachment_id: string
  mime_type: string
  wave_form: string
  size: number
  duration: number
}

interface LiveMessage {
  width: number
  height: number
  thumb_url: string
  url: string
}

interface VideoMessage {
  attachment_id: string
  mime_type: string
  wave_form: string
  width: number
  height: number
  size: number
  duration: number
  thumbnail: string
}

interface LocationMessage {
  name: string
  address: string
  longitude: number
  latitude: number
}

interface AppButtonMessage {
  label: string
  action: string
  color: string
}

interface MessageRequest {
  conversation_id: string
  recipient_id: string
  message_id: string
  category: string
  data: string
  representative_id: string
  quote_message_id: string
}

interface MessageClientRequest {
  sendMessage(message: MessageRequest): Promise<{}>
  sendMessages(messages: MessageRequest[]): Promise<{}>
}

