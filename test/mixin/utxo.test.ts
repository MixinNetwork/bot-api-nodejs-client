import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type { SafeTransactionRecipient, SafeUtxoOutput } from '../../src/client/types';
import { UtxoKeystoreClient } from '../../src/client/utxo';
import { hashMembers } from '../../src/client/utils/uniq';

const firstID = 'd1e9ec7e-199d-4578-91a0-a69d9a7ba048';
const secondID = '965e5c6e-434c-3fa9-b780-c50f43cd955c';

describe('UTXO client', () => {
  it('hashes output members without mutating the request', async () => {
    const get = vi.fn().mockResolvedValue([]);
    const client = UtxoKeystoreClient({ get } as unknown as AxiosInstance);
    const members = [firstID, secondID];
    const original = [...members];

    await client.outputs({ members, threshold: 2 });

    expect(members).toEqual(original);
    expect(get).toHaveBeenCalledWith('/outputs', {
      params: { members: hashMembers(members), threshold: 2 },
    });
  });

  it('sums only the safe outputs returned by the API', async () => {
    const outputs = [{ amount: '0.1' }, { amount: '0.2' }] as SafeUtxoOutput[];
    const get = vi.fn().mockResolvedValue(outputs);
    const client = UtxoKeystoreClient({ get } as unknown as AxiosInstance);

    await expect(client.safeAssetBalance({ asset: 'asset-id', members: [firstID], threshold: 1 })).resolves.toBe('0.3');
    expect(get).toHaveBeenCalledWith('/safe/outputs', {
      params: { asset: 'asset-id', members: hashMembers([firstID]), threshold: 1, state: 'unspent' },
    });
  });

  it('requests UUID ghost keys in sorted order without mutating recipients', async () => {
    const ghost = { mask: '11'.repeat(32), keys: ['22'.repeat(32)] };
    const post = vi.fn().mockResolvedValue([ghost]);
    const client = UtxoKeystoreClient({ post } as unknown as AxiosInstance);
    const members = [firstID, secondID];
    const original = [...members];
    const recipient: SafeTransactionRecipient = {
      amount: '1',
      mixAddress: { version: 2, threshold: 2, uuidMembers: members, xinMembers: [] },
    };

    await expect(client.ghostKey([recipient], 'trace-id', '33'.repeat(32))).resolves.toEqual([ghost]);

    expect(members).toEqual(original);
    expect(post).toHaveBeenCalledOnce();
    expect(post.mock.calls[0][0]).toBe('/safe/keys');
    expect(post.mock.calls[0][1][0]).toMatchObject({
      receivers: [secondID, firstID],
      index: 0,
    });
    expect(post.mock.calls[0][1][0].hint).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('does not request ghost keys for withdrawal recipients', async () => {
    const post = vi.fn();
    const client = UtxoKeystoreClient({ post } as unknown as AxiosInstance);

    await expect(client.ghostKey([{ destination: 'address', amount: '1' }], 'trace-id', '33'.repeat(32))).resolves.toEqual([undefined]);
    expect(post).not.toHaveBeenCalled();
  });
});
