import WebSocket from 'ws';
import { gzip, ungzip } from 'pako';
import { describe, expect, it, vi } from 'vitest';
import { decodeMessage, sendRaw } from '../src/blaze/utils';

const encodedEnvelope = (data: Record<string, unknown>) => gzip(Buffer.from(JSON.stringify({ data })));

describe('Blaze utilities', () => {
  it('decodes an envelope without changing message data by default', () => {
    const message = { message_id: 'message-id', data: Buffer.from('hello').toString('base64') };

    expect(decodeMessage(encodedEnvelope(message), { parse: false })).toEqual(message);
  });

  it('decodes base64 text and JSON message data when requested', () => {
    const json = encodedEnvelope({ data: Buffer.from(JSON.stringify({ value: 1 })).toString('base64') });
    const text = encodedEnvelope({ data: Buffer.from('plain text').toString('base64') });

    expect(decodeMessage(json, { parse: true }).data).toEqual({ value: 1 });
    expect(decodeMessage(text, { parse: true }).data).toBe('plain text');
  });

  it('sends a compressed JSON message on an open socket', async () => {
    const message = { id: 'request-id', action: 'LIST_PENDING_MESSAGES' };
    const send = vi.fn((data: Uint8Array, callback: () => void) => {
      expect(JSON.parse(ungzip(data, { to: 'string' }))).toEqual(message);
      callback();
    });
    const socket = { readyState: WebSocket.OPEN, send } as unknown as WebSocket;

    await expect(sendRaw(socket, message)).resolves.toBe(true);
    expect(send).toHaveBeenCalledOnce();
  });

  it('does not send on a socket that is not open', async () => {
    const send = vi.fn();
    const socket = { readyState: WebSocket.CLOSED, send } as unknown as WebSocket;

    await expect(sendRaw(socket, { id: 'request-id', action: 'action' })).resolves.toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it('resolves false when an open socket never invokes its callback', async () => {
    vi.useFakeTimers();
    const socket = { readyState: WebSocket.OPEN, send: vi.fn() } as unknown as WebSocket;
    const result = sendRaw(socket, { id: 'request-id', action: 'action' });

    await vi.advanceTimersByTimeAsync(5000);

    await expect(result).resolves.toBe(false);
    vi.useRealTimers();
  });
});
