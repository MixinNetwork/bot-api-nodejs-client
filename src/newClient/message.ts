import { AxiosInstance } from 'axios';
import { v4 as uuid } from 'uuid';
import Keystore from './types/keystore';
import {
  MessageResponse,
  AcknowledgementRequest,
  MessageCategory,
  MessageRequest,
  MessageView,
  StickerMessageRequest,
  ImageMessageRequest,
  AudioMessageRequest,
  VideoMessageRequest,
  ContactMessageRequest,
  AppCardMessageRequest,
  FileMessageRequest,
  LiveMessageRequest,
  LocationMessageRequest,
  AppButtonMessageRequest,
  TransferMessageRequest,
  RecallMessageRequest,
} from './types/message';
import { base64url } from '../mixin/sign';
import { buildClient } from './utils/client';
import { uniqueConversationID } from './utils/uniq';

export const MessageKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

  const send = (message: MessageRequest) => axiosInstance.post<unknown, any>('/messages', [message]);

  const sendMsg = (recipientID: string, category: MessageCategory, data: any): Promise<MessageView> => {
    if (typeof data === 'object') data = JSON.stringify(data);

    return send({
      category,
      recipient_id: recipientID,
      conversation_id: uniqueConversationID(keystore!.user_id, recipientID),
      message_id: uuid(),
      data: base64url(Buffer.from(data)),
    });
  };

  return {
    // Send the status of single message in bulk to Mixin Server
    sendAcknowledgement: (message: AcknowledgementRequest): Promise<MessageResponse[]> => axiosInstance.post<unknown, MessageResponse[]>('/acknowledgements', [message]),

    // Send the status of messages in bulk to Mixin Server
    sendAcknowledges: (messages: AcknowledgementRequest[]): Promise<MessageResponse[]> => axiosInstance.post<unknown, MessageResponse[]>('/acknowledgements', messages),

    // Send one message
    sendOne: send,

    // Send messages in bulk
    sendBatch: (messages: MessageRequest[]) => axiosInstance.post<unknown, any>('/messages', messages),

    // send one kind of message
    sendMsg,

    sendText: (userID: string, text: string): Promise<MessageView> => sendMsg(userID, 'PLAIN_TEXT', text),

    sendSticker: (userID: string, sticker: StickerMessageRequest) => sendMsg(userID, 'PLAIN_STICKER', sticker),

    sendImage: (userID: string, image: ImageMessageRequest): Promise<MessageView> => sendMsg(userID, 'PLAIN_IMAGE', image),

    sendAudio: (userID: string, audio: AudioMessageRequest) => sendMsg(userID, 'PLAIN_AUDIO', audio),

    sendVideo: (userID: string, video: VideoMessageRequest) => sendMsg(userID, 'PLAIN_VIDEO', video),

    sendContact: (userID: string, contact: ContactMessageRequest) => sendMsg(userID, 'PLAIN_CONTACT', contact),

    sendAppCard: (userID: string, appCard: AppCardMessageRequest): Promise<MessageView> => sendMsg(userID, 'APP_CARD', appCard),

    sendFile: (userID: string, file: FileMessageRequest): Promise<MessageView> => sendMsg(userID, 'PLAIN_DATA', file),

    sendLive: (userID: string, live: LiveMessageRequest) => sendMsg(userID, 'PLAIN_LIVE', live),

    sendLocation: (userID: string, location: LocationMessageRequest) => sendMsg(userID, 'PLAIN_LOCATION', location),

    sendPost: (userID: string, text: string): Promise<MessageView> => sendMsg(userID, 'PLAIN_POST', text),

    sendAppButton: (userID: string, appButton: AppButtonMessageRequest[]) => sendMsg(userID, 'APP_BUTTON_GROUP', appButton),

    sendTransfer: (userID: string, transfer: TransferMessageRequest) => sendMsg(userID, 'SYSTEM_ACCOUNT_SNAPSHOT', transfer),

    sendRecall: (userID: string, message: RecallMessageRequest) => sendMsg(userID, 'MESSAGE_RECALL', message),
  };
};

export const MessageClient = buildClient(MessageKeystoreClient);

export default MessageClient;