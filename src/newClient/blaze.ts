import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import { gzip, ungzip } from 'pako';
import Keystore from './types/keystore';
import { MessageView } from './types/message';
import { BlazeOptions, BlazeHandler, BlazeMessage } from './types/blaze';
import { websocket } from './ws';

const hostURL = ['wss://mixin-blaze.zeromesh.net', 'wss://blaze.mixin.one/'];

const BlazeKeystoreClient = (keystore: Keystore, wsOptions?: BlazeOptions) => {
  let url = hostURL[0];
  let ws: WebSocket | null = null;
  let isAlive = false;
  let pingInterval: ReturnType<typeof setInterval> | null = null;

  const option: BlazeOptions = {
    parse: false,
    syncAck: false,
    ...wsOptions
  };

  const decode = (data: Uint8Array): Promise<MessageView> => new Promise(resolve => {
    const t = ungzip(data, { to: 'string' });
    const msgObj = JSON.parse(t);

    if (option?.parse && msgObj.data && msgObj.data.data) {
      msgObj.data.data = Buffer.from(msgObj.data.data, 'base64').toString();

      try {
        msgObj.data.data = JSON.parse(msgObj.data.data);
      } catch (e) {
        // ignore error
      }
    }
    resolve(msgObj.data);
  });

  const sendRaw = (message: BlazeMessage): Promise<boolean> => new Promise(resolve => {
    const buffer = Buffer.from(JSON.stringify(message), 'utf-8');
    const zipped = gzip(buffer);

    if (ws!.readyState === WebSocket.OPEN) {
      ws!.send(zipped);
      resolve(true);
    } else {
      resolve(false);
    }
  });

  const loopBlaze = (h: BlazeHandler) => {
    ws = websocket(keystore, url);

    ws.onmessage = async event => {
      const msg = await decode(event.data as Uint8Array);
      if (!msg) return;

      if (msg.source === 'ACKNOWLEDGE_MESSAGE_RECEIPT' && h.onAckReceipt) await h.onAckReceipt(msg);
      else if (msg.category === 'SYSTEM_CONVERSATION' && h.onConversation) await h.onConversation(msg);
      else if (msg.category === 'SYSTEM_ACCOUNT_SNAPSHOT' && h.onTransfer) await h.onTransfer(msg);
      else await h.onMessage(msg);

      if (option.syncAck) {
        await sendRaw({
          id: uuid(),
          action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
          params: { message_id: msg.message_id, status: 'READ' },
        });
      }
    };

    ws.onclose = () => {
      clearInterval(Number(pingInterval));
      loopBlaze(h);
    };

    ws.onerror = e => {
      if (e.message !== 'Opening handshake has timed out') return;
      url = url === hostURL[0] ?hostURL[1] : hostURL[0];
    };

    ws.onopen = () => {
      isAlive = true;
      sendRaw({ id: uuid(), action: 'LIST_PENDING_MESSAGES' });
    };
  };

  return {
    loop: (h: BlazeHandler) => {
      if (!h.onMessage) throw new Error('OnMessage not set');
      loopBlaze(h);
    },

    heartbeat() {
      if (!ws) throw new Error('Use oop first');

      ws!.on('pong', () => {
        isAlive = true;
      });

      pingInterval = setInterval(() => {
        if (ws!.readyState === WebSocket.CONNECTING) return;
        if (isAlive) {
          ws!.terminate();
          return;
        }
        isAlive = false;
        ws!.ping();
      }, 1000 * 30);
    }
  };
};

export const BlazeClient = (keystore: Keystore, wsOptions?: BlazeOptions) => ({ blaze: BlazeKeystoreClient(keystore, wsOptions) });

export default BlazeClient;