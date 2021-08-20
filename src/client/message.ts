import { AxiosInstance } from "axios";
import { AcknowledgementRequest, Keystore, MessageClientRequest, MessageRequest } from "../types";

export class MessageClient implements MessageClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  newUUID!: () => string
  uniqueConversationID!: (userID: string, recipientID: string) => string
  sendAcknowledgements(messages: AcknowledgementRequest[]): Promise<void> {
    return this.request.post('/acknowledgements', messages)
  }
  sendAcknowledgement(message: AcknowledgementRequest): Promise<void> {
    return this.sendAcknowledgements([message])
  }
  sendMessage(message: MessageRequest): Promise<{}> {
    return this.sendMessages([message])
  }
  sendMessages(messages: MessageRequest[]): Promise<{}> {
    return this.request.post('/messages', messages)
  }

  sendMessageText(userID: string, text: string): Promise<{}> {
    return this.sendMessage({
      conversation_id: this.uniqueConversationID(this.keystore.client_id, userID),
      message_id: this.newUUID(),
      recipient_id: userID,
      data: Buffer.from(text).toString('base64'),
      category: 'PLAIN_TEXT'
    })
  }
  sendMessagePost(userID: string, text: string): Promise<{}> {
    return this.sendMessage({
      conversation_id: this.uniqueConversationID(this.keystore.client_id, userID),
      message_id: this.newUUID(),
      recipient_id: userID,
      data: Buffer.from(text).toString('base64'),
      category: 'PLAIN_POST'
    })
  }
}