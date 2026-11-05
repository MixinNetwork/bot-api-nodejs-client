import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type { AppKeystore, Keystore } from '../../src/client/types';
import { buildClient } from '../../src/client/utils/client';
import { MixinApi } from '../../src/client/mixin-client';
import { base64RawURLDecode } from '../../src/client/utils/base64';
import { sha256Hash } from '../../src/client/utils/uniq';

type Adapter = NonNullable<AxiosRequestConfig['adapter']>;

const keystore: AppKeystore = {
  app_id: '4b79fe76-0d9d-49e6-85fd-0f6be01147da',
  session_id: 'a03a4496-3e59-4abd-bd1e-1ab8a2acb550',
  session_private_key: '01'.repeat(32),
  server_public_key: '02'.repeat(32),
};

describe('client builders', () => {
  it('combines domain methods with the generic request method', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      config,
      data: { data: config.url },
      headers: {},
      status: 200,
      statusText: 'OK',
    }));
    const DomainClient = (axios: AxiosInstance, credentials: Keystore) => ({
      fetch: () => axios.get<unknown, string>('/domain'),
      credentials,
    });
    const Client = buildClient(DomainClient);
    const client = Client({
      keystore,
      requestConfig: { retry: 0, adapter: adapter as Adapter } as Parameters<typeof Client>[0]['requestConfig'] & { adapter: Adapter },
    });

    await expect(client.fetch()).resolves.toBe('/domain');
    await expect(client.request<string>({ url: '/generic', method: 'GET' })).resolves.toBe('/generic');
    expect(client.credentials).toBe(keystore);
    expect(adapter).toHaveBeenCalledTimes(2);
    for (const [config] of adapter.mock.calls) {
      expect(config.headers.get('Authorization')).toMatch(/^Bearer ey/);
    }
  });

  it.each([keystore, { app_id: keystore.app_id, authorization_id: keystore.session_id, session_private_key: keystore.session_private_key, scope: 'PROFILE:READ' }])(
    'authorizes public endpoints, OAuth exchange, and generic requests through MixinApi',
    async credentials => {
      const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({ config, data: { data: true }, headers: {}, status: 200, statusText: 'OK' }));
      const client = MixinApi({ keystore: credentials, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] });

      await client.network.chains();
      await client.network.topAssets();
      await client.external.exchangeRates();
      await client.code.fetch('code-id');
      await client.safe.fetchInscriptionItem('hash');
      await client.oauth.getToken({ client_id: keystore.app_id, code: 'code', client_secret: 'secret' });
      await client.request({ method: 'POST', url: '/custom', data: { value: 1 } });

      expect(adapter).toHaveBeenCalledTimes(7);
      for (const [config] of adapter.mock.calls) {
        const token = config.headers.get('Authorization') as string;
        const claims = JSON.parse(base64RawURLDecode(token.split('.')[1]).toString());
        const uri = new URL(`${config.baseURL}${config.url}`);
        if (config.params?.kind) uri.searchParams.set('kind', config.params.kind);
        expect(claims).toMatchObject({
          ...('session_id' in credentials ? { uid: credentials.app_id, sid: credentials.session_id } : { iss: credentials.app_id, aid: credentials.authorization_id }),
          jti: config.headers['X-Request-Id'],
          sig: sha256Hash(Buffer.from(`${config.method!.toUpperCase()}${uri.pathname}${uri.search}${config.data ?? ''}`)).toString('hex'),
        });
      }
    },
  );

  it('exchanges an OAuth code with only pre-login signing credentials', async () => {
    const credentials = { app_id: keystore.app_id, session_private_key: keystore.session_private_key };
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      config,
      data: { data: { scope: 'PROFILE:READ', authorization_id: keystore.session_id } },
      headers: {},
      status: 200,
      statusText: 'OK',
    }));
    const client = MixinApi({ keystore: credentials, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] });

    await expect(client.oauth.getToken({ client_id: credentials.app_id, code: 'code', ed25519: 'public-key' })).resolves.toMatchObject({
      scope: 'PROFILE:READ',
      authorization_id: keystore.session_id,
    });
    const config = adapter.mock.calls[0][0];
    const token = config.headers.get('Authorization') as string;
    expect(JSON.parse(base64RawURLDecode(token.split('.')[1]).toString())).toMatchObject({
      uid: credentials.app_id,
      sid: '',
      sig: sha256Hash(Buffer.from(`POST/oauth/token${config.data}`)).toString('hex'),
    });
  });

  it.each([{ url: 'https://example.test/me' }, { url: '/me', baseURL: 'https://example.test' }])(
    'rejects cross-origin requests through the public generic request method: %j',
    async config => {
      const adapter = vi.fn();
      const client = MixinApi({ keystore, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] });

      await expect(client.request(config)).rejects.toThrow('Invalid API origin');
      expect(adapter).not.toHaveBeenCalled();
    },
  );

  it.each(['../me', '../safe/assets', '%2e%2e/me', '..\\me', '..'])('rejects traversal through user search before sending: %s', async keyword => {
    const adapter = vi.fn();
    const client = MixinApi({ keystore, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] });

    await expect(client.user.search(keyword)).rejects.toThrow('Invalid API path');
    expect(adapter).not.toHaveBeenCalled();
  });

  it.each(['../../../me', '%2e%2e/%2e%2e/%2e%2e/safe/assets', '../../../me/.. ', '../../../me/..\u0000'])(
    'rejects traversal through asset search before sending: %s',
    async keyword => {
      const adapter = vi.fn();
      const client = MixinApi({ keystore, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] });

      await expect(client.network.searchAssets(keyword)).rejects.toThrow('Invalid API path');
      expect(adapter).not.toHaveBeenCalled();
    },
  );

  it('preserves ordinary user and asset searches', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({ config, data: { data: true }, headers: {}, status: 200, statusText: 'OK' }));
    const client = MixinApi({ keystore, requestConfig: { retry: 0, adapter } as Parameters<typeof MixinApi>[0]['requestConfig'] });

    await expect(client.user.search('7000100')).resolves.toBe(true);
    await expect(client.network.searchAssets('foo..bar')).resolves.toBe(true);
    expect(adapter.mock.calls.map(([config]) => config.url)).toEqual(['/search/7000100', '/network/assets/search/foo..bar']);
    expect(adapter.mock.calls[1][0].params).toEqual({ kind: 'ALL' });
    for (const [config] of adapter.mock.calls) expect(config.headers.get('Authorization')).toMatch(/^Bearer ey/);
  });

  it('rejects a missing domain client', () => {
    const Client = buildClient(undefined as never);

    expect(() => Client({ keystore })).toThrow('keystore client is required');
  });
});
