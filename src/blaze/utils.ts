import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import { gzip, ungzip } from 'pako';
import type Keystore from '../client/types/keystore';
import type { BlazeHandler, BlazeOptions, MessageView, BlazeMessage } from '../client/types';
import { signAccessToken } from '../client/utils';

export function websocket(
  keystore: Keystore | undefined,
  url: string,
  handler: BlazeHandler,
  option: BlazeOptions = {
    parse: false,
    syncAck: false,
  },
): WebSocket {
  const jwtToken = signAccessToken('GET', '/', '', uuid(), keystore) || '';
  const headers = {
    Authorization: `Bearer ${jwtToken}`,
  };
  const ws = new WebSocket(url, 'Mixin-Blaze-1', {
    headers,
    handshakeTimeout: 3000,
  });

  ws.onmessage = async event => {
    const msg = decodeMessage(event.data as Uint8Array, option);
    if (!msg) return;

    if (msg.source === 'ACKNOWLEDGE_MESSAGE_RECEIPT' && handler.onAckReceipt) await handler.onAckReceipt(msg);
    else if (msg.category === 'SYSTEM_CONVERSATION' && handler.onConversation) await handler.onConversation(msg);
    else if (msg.category === 'SYSTEM_ACCOUNT_SNAPSHOT' && handler.onTransfer) await handler.onTransfer(msg);
    else await handler.onMessage(msg);

    if (option.syncAck) {
      const message = {
        id: uuid(),
        action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
        params: { message_id: msg.message_id, status: 'READ' },
      };
      await sendRaw(ws, message);
    }
  };

  return ws;
}

export const decodeMessage = (data: Uint8Array, options: BlazeOptions): MessageView => {
  const t = ungzip(data, { to: 'string' });
  const msgObj = JSON.parse(t);

  if (options.parse && msgObj.data && msgObj.data.data) {
    msgObj.data.data = Buffer.from(msgObj.data.data, 'base64').toString();

    try {
      msgObj.data.data = JSON.parse(msgObj.data.data);
    } catch (e) {
      // ignore error
    }
  }

  return msgObj.data;
};

export const sendRaw = (ws: WebSocket, message: BlazeMessage): Promise<boolean> =>
  new Promise(resolve => {
    const buffer = Buffer.from(JSON.stringify(message), 'utf-8');
    const zipped = gzip(buffer);
    if (ws.readyState === WebSocket.OPEN) {
      const timer = setTimeout(() => {
        resolve(false);
      }, 5000);
      const cb = () => {
        clearTimeout(timer);
        resolve(true);
      };
      ws.send(zipped, cb);
      return;
    }
    resolve(false);
  });
