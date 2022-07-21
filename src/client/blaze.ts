import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import Keystore from './types/keystore';
import { BlazeOptions, BlazeHandler } from './types';
import { websocket } from './ws';
import { sendRaw } from './utils';

const wsHostURL = ['wss://mixin-blaze.zeromesh.net', 'wss://blaze.mixin.one/'];

export const BlazeKeystoreClient = (keystore: Keystore | undefined, wsOptions: BlazeOptions | undefined) => {
  let url = wsHostURL[0];
  let ws: WebSocket | null;
  let isAlive = false;
  let pingInterval: ReturnType<typeof setInterval> | null;

  const heartbeat = () => {
    ws!.on('pong', () => {
      isAlive = true;
    });

    pingInterval = setInterval(() => {
      if (ws!.readyState === WebSocket.CONNECTING) return;

      if (!isAlive) {
        ws!.terminate();
        return;
      }

      isAlive = false;
      ws!.ping();
    }, 1000 * 30);
  };

  const loopBlaze = (h: BlazeHandler) => {
    ws = websocket(keystore, url, h, wsOptions);
    heartbeat();

    ws.onopen = () => {
      isAlive = true;
      sendRaw(ws!, { id: uuid(), action: 'LIST_PENDING_MESSAGES' });
    };

    ws.onclose = () => {
      clearInterval(Number(pingInterval));
      loopBlaze(h);
    };

    ws.onerror = e => {
      if (e.message !== 'Opening handshake has timed out') return;
      url = url === wsHostURL[0] ? wsHostURL[1] : wsHostURL[0];
    };
  };

  return {
    loop: (h: BlazeHandler) => {
      if (!h.onMessage) throw new Error('OnMessage not set');
      loopBlaze(h);
    },
  };
};

export const BlazeClient = (keystore: Keystore, wsOptions?: BlazeOptions) => ({ blaze: BlazeKeystoreClient(keystore, wsOptions) });

export default BlazeClient;