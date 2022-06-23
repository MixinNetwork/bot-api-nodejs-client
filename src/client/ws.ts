import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import Keystore from './types/keystore';
import { signAccessToken } from './utils/auth';

export function websocket(keystore: Keystore | undefined, url: string): WebSocket {
  const jwtToken = signAccessToken('GET', '/', '', uuid(), keystore) || '';
  const headers = {
    Authorization: `Bearer ${ jwtToken }`,
  };
  const conn = new WebSocket(url, 'Mixin-Blaze-1', {
    headers,
    handshakeTimeout: 3000,
  });

  return conn;
}