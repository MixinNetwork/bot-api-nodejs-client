import WebSocket from 'ws';
import { gzip, ungzip } from 'pako';
import { MessageView, BlazeMessage, BlazeOptions } from '../types';

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
}

export const sendRaw = (ws: WebSocket, message: BlazeMessage): boolean => {
  const buffer = Buffer.from(JSON.stringify(message), 'utf-8');
  const zipped = gzip(buffer);

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(zipped);
    return true;
  }
  return false;
}
