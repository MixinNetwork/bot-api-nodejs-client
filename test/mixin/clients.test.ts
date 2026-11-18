import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { CircleKeystoreClient } from '../../src/client/circle';
import { CollectibleKeystoreClient } from '../../src/client/collectible';
import { ConversationKeystoreClient } from '../../src/client/conversation';
import { MultisigKeystoreClient } from '../../src/client/multisig';
import keystore from '../keystore';

describe('API clients', () => {
  it.each([
    '',
    'not-a-uuid',
    '67a8782818f546a1b6ccc72a97a77c43',
    '/exit#',
    '67a87828-18f5-46a1-b6cc-c72a97a77c43/exit#',
    '67a87828-18f5-46a1-b6cc-c72a97a77c43?operation=exit',
    '67a87828-18f5-46a1-b6cc-c72a97a77c43#',
    '67a87828-18f5-46a1-b6cc-c72a97a77c43%2Fexit%23',
    '67a87828-18f5-46a1-b6cc-c72a97a77c43\\exit#',
    '67a87828-18f5-46a1-b6cc-c72a97a77c43\n',
    undefined,
    null,
    123,
  ])('rejects an invalid group invitation code before sending: %s', async codeID => {
    const post = vi.fn().mockResolvedValue({});
    const client = ConversationKeystoreClient({ post } as unknown as AxiosInstance, keystore);

    await expect(client.joinGroup(codeID as string)).rejects.toThrow('invalid code id');
    expect(post).not.toHaveBeenCalled();
  });

  it.each(['67a87828-18f5-46a1-b6cc-c72a97a77c43', '67A87828-18F5-46A1-B6CC-C72A97A77C43'])('joins a group with a valid invitation code: %s', async codeID => {
    const conversation = { conversation_id: 'conversation-id' };
    const post = vi.fn().mockResolvedValue(conversation);
    const client = ConversationKeystoreClient({ post } as unknown as AxiosInstance, keystore);

    await expect(client.joinGroup(codeID)).resolves.toBe(conversation);
    expect(post).toHaveBeenCalledExactlyOnceWith(`/conversations/${codeID}/join`);
  });

  it.each([
    ['addUser', '/users/user-id/circles', 'ADD'],
    ['removeUser', '/users/user-id/circles', 'REMOVE'],
    ['addConversation', '/conversations/user-id/circles', 'ADD'],
    ['removeConversation', '/conversations/user-id/circles', 'REMOVE'],
  ] as const)('sends the documented circle payload from %s', async (method, path, action) => {
    const post = vi.fn().mockResolvedValue([]);
    const client = CircleKeystoreClient({ post } as unknown as AxiosInstance);

    await client[method]('user-id', 'circle-id');

    expect(post).toHaveBeenCalledWith(path, { circle_id: 'circle-id', action });
  });
});

describe.each([
  { path: '/multisigs/requests', createClient: MultisigKeystoreClient },
  { path: '/collectibles/requests', createClient: CollectibleKeystoreClient },
])('$path', ({ path, createClient }) => {
  const requestID = '67a87828-18f5-46a1-b6cc-c72a97a77c43';

  it.each(['not-a-uuid', `${requestID}/extra#details`, `${requestID}%2Fextra%23details`, `${requestID}\n`, null])('rejects an invalid request ID: %s', async invalidID => {
    const post = vi.fn();
    const client = createClient({ post } as unknown as AxiosInstance, { ...keystore, server_public_key: '' });

    for (const action of ['sign', 'unlock', 'cancel'] as const) {
      await expect(client[action]('123456', invalidID as string)).rejects.toThrow('invalid request id');
    }
    expect(post).not.toHaveBeenCalled();
  });

  it.each(['sign', 'unlock', 'cancel'] as const)('sends the requested %s action with the encrypted PIN', async action => {
    const post = vi.fn().mockResolvedValue({});
    const client = createClient({ post } as unknown as AxiosInstance, keystore);

    await client[action]('123456', requestID);

    expect(post).toHaveBeenCalledExactlyOnceWith(`${path}/${requestID}/${action}`, { pin: expect.stringMatching(/^[A-Za-z0-9_-]+$/) });
  });
});
