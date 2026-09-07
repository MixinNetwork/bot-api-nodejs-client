import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type { AppKeystore } from '../../src/client/types';
import { MessageKeystoreClient } from '../../src/client/message';
import { base64RawURLDecode } from '../../src/client/utils/base64';
import { uniqueConversationID } from '../../src/client/utils/uniq';

const keystore: AppKeystore = {
  app_id: '4b79fe76-0d9d-49e6-85fd-0f6be01147da',
  session_id: 'a03a4496-3e59-4abd-bd1e-1ab8a2acb550',
  session_private_key: '01'.repeat(32),
  server_public_key: '02'.repeat(32),
};
const recipientID = '772e6bef-3bff-4fcc-987d-29bafca74d63';

describe('message client', () => {
  it('builds and posts a plain text message', async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const client = MessageKeystoreClient({ post } as unknown as AxiosInstance, keystore);

    const message = await client.sendText(recipientID, 'hello');

    expect(message).toMatchObject({
      category: 'PLAIN_TEXT',
      recipient_id: recipientID,
      conversation_id: uniqueConversationID(keystore.app_id, recipientID),
    });
    expect(message.message_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(base64RawURLDecode(message.data_base64).toString()).toBe('hello');
    expect(post).toHaveBeenCalledWith('/messages', [message]);
  });

  it('serializes structured message data before posting', async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const client = MessageKeystoreClient({ post } as unknown as AxiosInstance, keystore);

    const message = await client.sendSticker(recipientID, { sticker_id: 'sticker-id' });

    expect(message.category).toBe('PLAIN_STICKER');
    expect(JSON.parse(base64RawURLDecode(message.data_base64).toString())).toEqual({ sticker_id: 'sticker-id' });
  });

  it('rejects convenience sends without a keystore', async () => {
    const post = vi.fn();
    const client = MessageKeystoreClient({ post } as unknown as AxiosInstance, undefined);

    await expect(client.sendText(recipientID, 'hello')).rejects.toThrow('No Keystore Provided');
    expect(post).not.toHaveBeenCalled();
  });

  it('forwards acknowledgement, batch, one, and legacy payload shapes', async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const client = MessageKeystoreClient({ post } as unknown as AxiosInstance, keystore);
    const acknowledgement = { message_id: 'message-id', status: 'READ' } as Parameters<typeof client.sendAcknowledgement>[0];
    const message = { message_id: 'message-id' } as Parameters<typeof client.sendOne>[0];

    await client.sendAcknowledgement(acknowledgement);
    await client.sendAcknowledges([acknowledgement]);
    await client.sendOne(message);
    await client.sendBatch([message]);
    await client.sendLegacy(message);

    expect(post.mock.calls).toEqual([
      ['/acknowledgements', [acknowledgement]],
      ['/acknowledgements', [acknowledgement]],
      ['/messages', [message]],
      ['/messages', [message]],
      ['/messages', message],
    ]);
  });
});
