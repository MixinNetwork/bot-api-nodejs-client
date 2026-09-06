import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { CircleKeystoreClient } from '../../src/client/circle';

describe('API clients', () => {
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
