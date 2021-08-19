
export type MessageCategory = "PLAIN_TEXT" |
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


export type MessageStatus = "SENT" | "DELIVER" | "READ"

export interface RecallMessage {
  message_id: string
}

export interface ImageMessage {
  attachment_id: string
  mime_type: string
  width: number
  height: number
  size: number
  thumbnail: string
}

export interface DataMessage {
  attachment_id: string
  mime_type: string
  size: number
  name: string
}

export interface StickerMessage {
  name: string
  album_id: string
}

export interface ContactMesage {
  user_id: string
}

export interface AppCardMessage {
  app_id: string
  icon_url: string
  title: string
  description: string
  action: string
}

export interface AudioMessage {
  attachment_id: string
  mime_type: string
  wave_form: string
  size: number
  duration: number
}

export interface LiveMessage {
  width: number
  height: number
  thumb_url: string
  url: string
}

export interface VideoMessage {
  attachment_id: string
  mime_type: string
  wave_form: string
  width: number
  height: number
  size: number
  duration: number
  thumbnail: string
}

export interface LocationMessage {
  name: string
  address: string
  longitude: number
  latitude: number
}

export interface AppButtonMessage {
  label: string
  action: string
  color: string
}

export interface MessageRequest {
  conversation_id: string
  message_id: string
  category: string
  data: string
  recipient_id?: string
  representative_id?: string
  quote_message_id?: string
}

export interface AcknowledgementRequest {
  message_id: string
  status: string
}

export interface MessageClientRequest {
  sendAcknowledgements(messages: AcknowledgementRequest[]): Promise<void>
  sendAcknowledgement(message: AcknowledgementRequest): Promise<void>
  sendMessage(message: MessageRequest): Promise<{}>
  sendMessages(messages: MessageRequest[]): Promise<{}>
}

