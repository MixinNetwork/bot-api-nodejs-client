import { AxiosInstance } from 'axios';
import { v4 as uuid } from 'uuid';
import { base64url } from '../mixin/sign';
import { buildClient } from './utils/client';
import { uniqueConversationID } from './utils/uniq';
import Keystore from './types/keystore';
import {
  MessageResponse,
  AcknowledgementRequest,
  MessageCategory,
  MessageRequest,
  MessageView,
  ImageMessage,
  StickerMessage,
  ContactMesage,
  AppCardMessage,
  AudioMessage,
  LiveMessage,
  LocationMessage,
  VideoMessage,
  AppButtonMessage,
  RecallMessage,
  TransferMessage,
  FileMessage,
} from './types/message';

export const MessagesKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {

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

    sendSticker: (userID: string, sticker: StickerMessage) => sendMsg(userID, 'PLAIN_STICKER', sticker),

    sendImage: (userID: string, image: ImageMessage): Promise<MessageView> => sendMsg(userID, 'PLAIN_IMAGE', image),

    sendAudio: (userID: string, audio: AudioMessage) => sendMsg(userID, 'PLAIN_AUDIO', audio),

    sendVideo: (userID: string, video: VideoMessage) => sendMsg(userID, 'PLAIN_VIDEO', video),

    sendContact: (userID: string, contact: ContactMesage) => sendMsg(userID, 'PLAIN_CONTACT', contact),

    sendAppCard: (userID: string, appCard: AppCardMessage): Promise<MessageView> => sendMsg(userID, 'APP_CARD', appCard),

    sendFile: (userID: string, file: FileMessage): Promise<MessageView> => sendMsg(userID, 'PLAIN_DATA', file),

    sendLive: (userID: string, live: LiveMessage) => sendMsg(userID, 'PLAIN_LIVE', live),

    sendLocation: (userID: string, location: LocationMessage) => sendMsg(userID, 'PLAIN_LOCATION', location),

    sendPost: (userID: string, text: string): Promise<MessageView> => sendMsg(userID, 'PLAIN_POST', text),

    sendAppButton: (userID: string, appButton: AppButtonMessage[]) => sendMsg(userID, 'APP_BUTTON_GROUP', appButton),

    sendTransfer: (userID: string, transfer: TransferMessage) => sendMsg(userID, 'SYSTEM_ACCOUNT_SNAPSHOT', transfer),

    sendRecall: (userID: string, message: RecallMessage) => sendMsg(userID, 'MESSAGE_RECALL', message),
  };
};

export const MessagesClient = buildClient(MessagesKeystoreClient);

export default MessagesClient;