import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import Keystore from './types/keystore';
import {
  BlazeOptions,
  BlazeHandler,
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
} from './types';
import { websocket } from './ws';
import { base64RawURLEncode, sendRaw, uniqueConversationID } from './utils';

const wsHostURL = ['wss://mixin-blaze.zeromesh.net', 'wss://blaze.mixin.one/'];

export const BlazeKeystoreClient = (keystore: Keystore | undefined, wsOptions: BlazeOptions | undefined) => {
  let url = wsHostURL[0];
  let ws: WebSocket | null = null;
  let pingTimeout: ReturnType<typeof setTimeout> | undefined;

  const heartbeat = () => {
    clearTimeout(Number(setTimeout));

    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    pingTimeout = setTimeout(() => {
      ws?.terminate();
    }, 1000 * 5 + 1000 * 5);
  };

  const loopBlaze = (h: BlazeHandler) => {
    ws = websocket(keystore, url, h, wsOptions);
    if (!ws) throw new Error('Ws is null, check keystore');

    ws.onopen = () => {
      heartbeat();
      sendRaw(ws!, { id: uuid(), action: 'LIST_PENDING_MESSAGES' });
    };

    ws.on('ping', heartbeat);

    ws.onclose = () => {
      clearInterval(Number(pingTimeout));
      loopBlaze(h);
    };

    ws.onerror = e => {
      if (e.message !== 'Opening handshake has timed out') return;
      url = url === wsHostURL[0] ? wsHostURL[1] : wsHostURL[0];
    };
  };

  const sendMsg = (recipientID: string, category: string, data: any) => {
    if (typeof data === 'object') data = JSON.stringify(data);

    const message = {
      id: uuid(),
      action: 'CREATE_MESSAGE',
      params: {
        category,
        recipient_id: recipientID,
        conversation_id: uniqueConversationID(keystore!.user_id, recipientID),
        message_id: uuid(),
        data: base64RawURLEncode(Buffer.from(data)),
      },
    };
    sendRaw(ws!, message);
    return message.params;
  };

  return {
    loop: (h: BlazeHandler) => {
      if (!h.onMessage) throw new Error('OnMessage not set');
      if (!keystore) throw new Error('Keystore not set in MixinApi');
      loopBlaze(h);
    },

    sendMsg,

    sendText: (recipientID: string, text: string) => sendMsg(recipientID, 'PLAIN_TEXT', text),

    sendSticker: (recipientID: string, sticker: StickerMessageRequest) => sendMsg(recipientID, 'PLAIN_STICKER', sticker),

    sendImage: (recipientID: string, image: ImageMessageRequest) => sendMsg(recipientID, 'PLAIN_IMAGE', image),

    sendAudio: (recipientID: string, audio: AudioMessageRequest) => sendMsg(recipientID, 'PLAIN_AUDIO', audio),

    sendVideo: (recipientID: string, video: VideoMessageRequest) => sendMsg(recipientID, 'PLAIN_VIDEO', video),

    sendContact: (recipientID: string, contact: ContactMessageRequest) => sendMsg(recipientID, 'PLAIN_CONTACT', contact),

    sendAppCard: (recipientID: string, appCard: AppCardMessageRequest) => sendMsg(recipientID, 'APP_CARD', appCard),

    sendFile: (recipientID: string, file: FileMessageRequest) => sendMsg(recipientID, 'PLAIN_DATA', file),

    sendLive: (recipientID: string, live: LiveMessageRequest) => sendMsg(recipientID, 'PLAIN_LIVE', live),

    sendLocation: (recipientID: string, location: LocationMessageRequest) => sendMsg(recipientID, 'PLAIN_LOCATION', location),

    sendPost: (recipientID: string, text: string) => sendMsg(recipientID, 'PLAIN_POST', text),

    sendAppButton: (recipientID: string, appButton: AppButtonMessageRequest[]) => sendMsg(recipientID, 'APP_BUTTON_GROUP', appButton),

    sendTransfer: (recipientID: string, transfer: TransferMessageRequest) => sendMsg(recipientID, 'SYSTEM_ACCOUNT_SNAPSHOT', transfer),

    sendRecall: (recipientID: string, message: RecallMessageRequest) => sendMsg(recipientID, 'MESSAGE_RECALL', message),
  };
};

export const BlazeClient = (keystore: Keystore, wsOptions?: BlazeOptions) => ({ blaze: BlazeKeystoreClient(keystore, wsOptions) });

export default BlazeClient;
