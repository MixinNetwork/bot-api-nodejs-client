import WebSocket from 'ws';
import Keystore from './types/keystore';
import { signAuthenticationToken } from './utils/signToken';

export function websocket(keystore: Keystore | undefined, url: string): WebSocket {
  const jwtToken = signAuthenticationToken('GET', '/', '', keystore) || '';
  const headers = {
    Authorization: `Bearer ${ jwtToken }`,
  };
  const conn = new WebSocket(url, 'Mixin-Blaze-1', {
    headers,
    handshakeTimeout: 3000,
  });

  return conn;
}