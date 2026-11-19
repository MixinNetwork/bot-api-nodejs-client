import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { MixinApi } from '../../src/client/mixin-client';
import { base64RawURLDecode } from '../../src/client/utils/base64';
import { sha256Hash } from '../../src/client/utils/uniq';
import keystore from '../keystore';

type Adapter = NonNullable<AxiosRequestConfig['adapter']>;
type Client = ReturnType<typeof MixinApi>;

const chainID = '43d61dcd-e413-450d-80b8-101d5e903357';
const snapshotID = '67a87828-18f5-46a1-b6cc-c72a97a77c43';

const createClient = () => {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({ config, data: { data: [] }, headers: {}, status: 200, statusText: 'OK' }));
  const client = MixinApi({ keystore, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] & { adapter: Adapter } });
  return { client, adapter };
};

describe('Authorization header on API client requests', () => {
  it.each([
    { name: 'network.chains', call: (c: Client) => c.network.chains(), uri: '/network/chains' },
    { name: 'network.fetchChain', call: (c: Client) => c.network.fetchChain(chainID), uri: `/network/chains/${chainID}` },
    {
      name: 'safe.fetchSafeSnapshots',
      call: (c: Client) => c.safe.fetchSafeSnapshots({ asset: chainID, limit: 10 }),
      uri: `/safe/snapshots?asset=${chainID}&limit=10`,
    },
    { name: 'safe.fetchSafeSnapshot', call: (c: Client) => c.safe.fetchSafeSnapshot(snapshotID), uri: `/safe/snapshots/${snapshotID}` },
  ])('$name sends a signed Bearer token for GET $uri', async ({ call, uri }) => {
    const { client, adapter } = createClient();

    await call(client);

    expect(adapter).toHaveBeenCalledOnce();
    const config = adapter.mock.calls[0][0];
    const authorization = config.headers.get('Authorization') as string;
    expect(authorization).toMatch(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);

    const claims = JSON.parse(base64RawURLDecode(authorization.slice('Bearer '.length).split('.')[1]).toString());
    expect(claims).toMatchObject({
      uid: keystore.app_id,
      sid: keystore.session_id,
      jti: config.headers['X-Request-Id'],
      sig: sha256Hash(Buffer.from(`GET${uri}`)).toString('hex'),
    });
    expect(claims.exp - claims.iat).toBe(300);
  });

  it('signs every request independently', async () => {
    const { client, adapter } = createClient();

    await client.network.chains();
    await client.safe.fetchSafeSnapshots({});
    await client.network.chains();

    expect(adapter).toHaveBeenCalledTimes(3);
    const ids = adapter.mock.calls.map(([config]) => {
      expect(config.headers.get('Authorization')).toMatch(/^Bearer ey/);
      return config.headers['X-Request-Id'];
    });
    expect(new Set(ids).size).toBe(3);
  });
});
