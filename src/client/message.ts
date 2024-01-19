import { AxiosInstance } from 'axios';
import { v4 as uuid } from 'uuid';
import Keystore from './types/keystore';
import {
  AcknowledgementRequest,
  AcknowledgementResponse,
  MessageCategory,
  MessageRequest,
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
import { uniqueConversationID, base64RawURLEncode, buildClient } from './utils';

/**
 * Methods to send messages
 * Note:
 * * To receive a list of messages from Mixin message service, you need to setup a websocket connection.
 *   After receiving the message via WebSocket, you need to acknowledge the message to Mixin message service,
 *   otherwise it will keep pushing the message.
 */
export const MessageKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  const send = (message: MessageRequest) => axiosInstance.post<unknown, any>('/messages', [message]);

  const sendMsg = async (recipientID: string, category: MessageCategory, data: any): Promise<MessageRequest> => {
    if (!keystore) throw new Error('No Keystore Provided');
    if (typeof data === 'object') data = JSON.stringify(data);

    const messageRequest = {
      category,
      recipient_id: recipientID,
      conversation_id: uniqueConversationID(keystore.app_id, recipientID),
      message_id: uuid(),
      data: base64RawURLEncode(Buffer.from(data)),
    };
    await send(messageRequest);
    return messageRequest;
  };

  return {
    /** Send the status of single message in bulk to Mixin Server */
    sendAcknowledgement: (message: AcknowledgementRequest): Promise<AcknowledgementResponse[]> =>
      axiosInstance.post<unknown, AcknowledgementResponse[]>('/acknowledgements', [message]),

    /** Send the status of messages in bulk to Mixin Server */
    sendAcknowledges: (messages: AcknowledgementRequest[]): Promise<AcknowledgementResponse[]> =>
      axiosInstance.post<unknown, AcknowledgementResponse[]>('/acknowledgements', messages),

    /** Send one message */
    sendOne: send,

    /**
     * Send messages in bulk
     * A maximum of 100 messages can be sent in batch each time, and the message body cannot exceed 128Kb
     */
    sendBatch: (messages: MessageRequest[]) => axiosInstance.post<unknown, any>('/messages', messages),

    /** send one kind of message */
    sendMsg,

    sendText: (userID: string, text: string): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_TEXT', text),

    sendSticker: (userID: string, sticker: StickerMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_STICKER', sticker),

    sendImage: (userID: string, image: ImageMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_IMAGE', image),

    sendAudio: (userID: string, audio: AudioMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_AUDIO', audio),

    sendVideo: (userID: string, video: VideoMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_VIDEO', video),

    sendContact: (userID: string, contact: ContactMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_CONTACT', contact),

    sendAppCard: (userID: string, appCard: AppCardMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'APP_CARD', appCard),

    sendFile: (userID: string, file: FileMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_DATA', file),

    sendLive: (userID: string, live: LiveMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_LIVE', live),

    sendLocation: (userID: string, location: LocationMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_LOCATION', location),

    sendPost: (userID: string, text: string): Promise<MessageRequest> => sendMsg(userID, 'PLAIN_POST', text),

    sendAppButton: (userID: string, appButton: AppButtonMessageRequest[]): Promise<MessageRequest> => sendMsg(userID, 'APP_BUTTON_GROUP', appButton),

    sendTransfer: (userID: string, transfer: TransferMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'SYSTEM_ACCOUNT_SNAPSHOT', transfer),

    sendRecall: (userID: string, message: RecallMessageRequest): Promise<MessageRequest> => sendMsg(userID, 'MESSAGE_RECALL', message),
  };
};

export const MessageClient = buildClient(MessageKeystoreClient);

export default MessageClient;
