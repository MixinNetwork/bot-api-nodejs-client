import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import type Keystore from '../client/types/keystore';
import type { BlazeOptions, BlazeHandler } from './type';
import { websocket, sendRaw } from './utils';

export const BlazeKeystoreClient = (keystore: Keystore | undefined, wsOptions: BlazeOptions | undefined) => {
  const url = 'wss://blaze.mixin.one';

  let ws: WebSocket | undefined;
  let pingTimeout: ReturnType<typeof setTimeout> | undefined;

  const terminate = () => {
    clearTimeout(Number(pingTimeout));
    if (!ws) return;
    ws.terminate();
    ws = undefined;
  };

  const heartbeat = () => {
    clearTimeout(Number(pingTimeout));
    pingTimeout = setTimeout(terminate, 1000 * 30);
  };

  const loopBlaze = (h: BlazeHandler) => {
    if (ws) return;
    ws = websocket(keystore, url, h, wsOptions);
    heartbeat();

    ws.on('ping', heartbeat);

    ws.onopen = () => {
      heartbeat();
      if (ws) sendRaw(ws, { id: uuid(), action: 'LIST_PENDING_MESSAGES' });
    };

    ws.onclose = () => {
      terminate();
      loopBlaze(h);
    };

    ws.onerror = e => {
      if (e.message !== 'Opening handshake has timed out') return;
      terminate();
    };
  };

  return {
    loop: (h: BlazeHandler) => {
      if (ws) throw new Error('Blaze is already running');
      if (!h.onMessage) throw new Error('OnMessage not set');
      loopBlaze(h);
    },
    stopLoop: () => {
      terminate();
    },
    getWebSocket: () => ws,
  };
};

export const BlazeClient = (keystore: Keystore, wsOptions?: BlazeOptions) => ({ blaze: BlazeKeystoreClient(keystore, wsOptions) });

export default BlazeClient;
