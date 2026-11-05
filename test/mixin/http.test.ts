import { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { ResponseError } from '../../src/client/error';
import { http } from '../../src/client/http';
import type { Keystore } from '../../src/client/types';
import { base64RawURLDecode } from '../../src/client/utils/base64';
import { sha256Hash } from '../../src/client/utils/uniq';

const keystore = {
  app_id: '4b79fe76-0d9d-49e6-85fd-0f6be01147da',
  session_id: 'a03a4496-3e59-4abd-bd1e-1ab8a2acb550',
  session_private_key: '01'.repeat(32),
  server_public_key: '02'.repeat(32),
};

type Adapter = NonNullable<AxiosRequestConfig['adapter']>;

const response = (config: InternalAxiosRequestConfig, data: unknown) => ({
  config,
  data,
  headers: {},
  status: 200,
  statusText: 'OK',
});

describe('HTTP client', () => {
  it.each([{} as Keystore, { ...keystore, session_private_key: '01' }, { ...keystore, session_id: 'invalid' }])(
    'rejects invalid credentials before sending a request',
    async credentials => {
      const adapter = vi.fn();
      const errorMap = vi.fn();
      const client = http(credentials, { retry: 0, errorMap, adapter } as Parameters<typeof http>[1]);

      await expect(client.get('/network')).rejects.toThrow('Invalid keystore');
      expect(adapter).not.toHaveBeenCalled();
      expect(errorMap).toHaveBeenCalledOnce();
    },
  );

  it('rejects an unsigned request even when an Authorization header is provided', async () => {
    const adapter = vi.fn();
    const client = http(undefined as never, { headers: { Authorization: 'Bearer external' }, retry: 0, adapter } as Parameters<typeof http>[1]);

    await expect(client.get('/network')).rejects.toThrow('Invalid keystore');
    expect(adapter).not.toHaveBeenCalled();
  });

  it('always signs requests with the supplied keystore', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { data: true }));
    const client = http(keystore, { retry: 0, adapter } as Parameters<typeof http>[1]);

    await expect(client.get('/network', { headers: { authorization: false } })).resolves.toBe(true);
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toMatch(/^Bearer ey/);
  });

  it.each([
    { url: '/search/../me' },
    { url: '/search/..' },
    { url: '/search/%2e%2e/me' },
    { url: '/search/.%2E/me' },
    { url: '/search/%2e./me' },
    { url: '/search/..\\me' },
    { url: '/search\\..\\me' },
    { url: '/search/.\t./me' },
    { url: '/search/.\n./me' },
    { url: '/search/.\r./me' },
    { url: '/search/.. ' },
    { url: '/search/..\u0000' },
    { url: '/search/..\u001f' },
    { url: '/search/./me' },
    { url: '/search/%2e/me' },
    { url: 'https://api.mixin.one/search/../me' },
    { url: '/search/%2E%2E?kind=ALL' },
    { url: '/search/.. ', params: { kind: 'ALL' } },
    { url: '/search/..\u0000', params: { kind: 'ALL' } },
    { url: '/search/%2e%2e ', params: { kind: 'ALL' } },
    { url: '/me', baseURL: 'https://api.mixin.one/search/%2e%2e' },
  ])('rejects dot path segments before signing or sending: %j', async config => {
    const adapter = vi.fn();
    const errorMap = vi.fn();
    const client = http({} as Keystore, { retry: 0, errorMap, adapter } as Parameters<typeof http>[1]);

    await expect(client.request(config)).rejects.toThrow('Invalid API path: dot segments are not allowed');
    expect(adapter).not.toHaveBeenCalled();
    expect(errorMap).toHaveBeenCalledOnce();
  });

  it.each(['https://api.mixin.one/search/..', 'https://api.mixin.one/search/%2e%2e'])('rejects dot segments in the configured baseURL: %s', async baseURL => {
    const adapter = vi.fn();
    const client = http(keystore, { baseURL, retry: 0, adapter } as Parameters<typeof http>[1]);

    await expect(client.get('/me')).rejects.toThrow('Invalid API path');
    expect(adapter).not.toHaveBeenCalled();
  });

  it.each([
    '/search/foo..bar',
    '/search/...',
    '/search/..%2Fme',
    '/search/%252e%252e/me',
    '/search/..\u00a0',
    '/search/.. ?kind=ALL',
    '/search/bitcoin?q=../me',
    '/search/bitcoin?q=..\\me',
    '/search/bitcoin#/../me',
  ])('preserves ordinary paths and dot sequences in query strings or fragments: %s', async url => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { data: true }));
    const client = http(keystore, { retry: 0, adapter } as Parameters<typeof http>[1]);

    await expect(client.get(url)).resolves.toBe(true);
    expect(adapter).toHaveBeenCalledOnce();
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toMatch(/^Bearer ey/);
  });

  it.each(['/resource/a%2Fb?name=hello%20world', 'https://api.mixin.one/api/resource/a%2Fb?name=hello%20world', 'HTTPS://API.MIXIN.ONE:443/api/resource/a%2Fb?name=hello%20world'])(
    'signs the full request URI and transmitted body for %s',
    async url => {
      const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { data: true }));
      const client = http(keystore, {
        baseURL: 'https://api.mixin.one/api',
        headers: { authorization: 'Bearer external' },
        retry: 0,
        adapter,
      } as Parameters<typeof http>[1]);
      await client.post(url, { text: '<hello>' }, { params: { order: 'DESC' } });

      const config = adapter.mock.calls[0][0];
      const token = config.headers.get('Authorization') as string;
      const claims = JSON.parse(base64RawURLDecode(token.split('.')[1]).toString());
      expect(claims).toMatchObject({
        uid: keystore.app_id,
        sid: keystore.session_id,
        jti: config.headers['X-Request-Id'],
        sig: sha256Hash(Buffer.from(`POST/api/resource/a%2Fb?name=hello%20world&order=DESC${config.data}`)).toString('hex'),
      });
    },
  );

  it.each([
    'https://example.test/me',
    'https://api.mixin.one.example.test/me',
    'https://api.mixin.one@evil.test/me',
    'https://api.mixin.one:8443/me',
    'http://api.mixin.one/me',
    'https://api.mixin.one./me',
  ])('rejects an untrusted absolute URL before sending: %s', async url => {
    const adapter = vi.fn();
    const errorMap = vi.fn();
    const client = http(keystore, { retry: 0, errorMap, adapter } as Parameters<typeof http>[1]);

    await expect(client.get(url)).rejects.toThrow('Invalid API origin');
    expect(adapter).not.toHaveBeenCalled();
    expect(errorMap).toHaveBeenCalledOnce();
  });

  it.each(['https://example.test', 'http://api.mixin.one', 'https://api.mixin.one:8443'])('rejects an untrusted configured baseURL before sending: %s', async baseURL => {
    const adapter = vi.fn();
    const client = http(keystore, { baseURL, retry: 0, adapter } as Parameters<typeof http>[1]);

    await expect(client.get('/me')).rejects.toThrow('Invalid API origin');
    expect(adapter).not.toHaveBeenCalled();
  });

  it.each([{ url: '/me', baseURL: '' }, { url: '/me', baseURL: '/api' }, { url: '/me', baseURL: '//api.mixin.one' }, { url: '//api.mixin.one/me' }, { url: '//example.test/me' }])(
    'rejects a URL that a browser could resolve against its own origin or protocol: %j',
    async config => {
      const adapter = vi.fn();
      const client = http(keystore, { retry: 0, adapter } as Parameters<typeof http>[1]);

      await expect(client.request(config)).rejects.toThrow();
      expect(adapter).not.toHaveBeenCalled();
    },
  );

  it('adds request metadata, unwraps data, and honors retry: 0', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { data: { ok: true } }));
    const client = http(keystore, {
      baseURL: 'https://api.mixin.one',
      headers: { 'X-Client': 'test', Authorization: 'Bearer external' },
      retry: 0,
      timeout: 0,
      adapter: adapter as Adapter,
    } as Parameters<typeof http>[1] & { adapter: Adapter });

    await expect(client.get('/resource', { params: { q: 'value' } })).resolves.toEqual({ ok: true });

    const config = adapter.mock.calls[0][0] as InternalAxiosRequestConfig & {
      'axios-retry': { retries: number };
    };
    expect(config.headers['X-Client']).toBe('test');
    expect(config.headers['X-Request-Id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(config.headers.Authorization).toMatch(/^Bearer ey/);
    expect(config.timeout).toBe(0);
    expect(config['axios-retry'].retries).toBe(0);
  });

  it('turns an API error envelope into ResponseError and invokes error hooks', async () => {
    const apiError = { code: 20119, description: 'PIN is incorrect', status: 400, extra: { attempts: 1 } };
    const responseCallback = vi.fn();
    const errorMap = vi.fn();
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { error: apiError }));
    const client = http(keystore, {
      retry: 0,
      responseCallback,
      errorMap,
      adapter: adapter as Adapter,
    } as Parameters<typeof http>[1] & { adapter: Adapter });

    const request = client.post('/resource', { value: 1 });

    await expect(request).rejects.toMatchObject({
      code: 20119,
      description: 'PIN is incorrect',
      status: 400,
      extra: { attempts: 1 },
    });
    expect(responseCallback).toHaveBeenCalledOnce();
    expect(errorMap).toHaveBeenCalledOnce();
    expect(responseCallback.mock.calls[0][0]).toBeInstanceOf(ResponseError);
  });

  it('passes transport errors through both error hooks', async () => {
    const transportError = new AxiosError('connection failed', 'ECONNABORTED');
    const responseCallback = vi.fn();
    const errorMap = vi.fn();
    const adapter = vi.fn(async () => {
      throw transportError;
    });
    const client = http(keystore, {
      retry: 0,
      responseCallback,
      errorMap,
      adapter: adapter as Adapter,
    } as Parameters<typeof http>[1] & { adapter: Adapter });

    await expect(client.get('/resource')).rejects.toBe(transportError);
    expect(responseCallback).toHaveBeenCalledWith(transportError);
    expect(errorMap).toHaveBeenCalledWith(transportError);
  });
});
