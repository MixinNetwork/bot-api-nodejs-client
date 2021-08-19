import { AxiosInstance } from "axios";
import { AcknowledgementRequest, MessageClientRequest, MessageRequest } from "../types";

export class MessageClient implements MessageClientRequest {
  request!: AxiosInstance

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
}