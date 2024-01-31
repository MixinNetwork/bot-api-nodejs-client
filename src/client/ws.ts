import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import Keystore from './types/keystore';
import { BlazeHandler, BlazeOptions } from './types';
import { signAccessToken, decodeMessage, sendRaw } from './utils';

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
