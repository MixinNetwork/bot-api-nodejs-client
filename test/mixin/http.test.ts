import { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { ResponseError } from '../../src/client/error';
import { http } from '../../src/client/http';

type Adapter = NonNullable<AxiosRequestConfig['adapter']>;

const response = (config: InternalAxiosRequestConfig, data: unknown) => ({
  config,
  data,
  headers: {},
  status: 200,
  statusText: 'OK',
});

describe('HTTP client', () => {
  it('adds request metadata, unwraps data, and honors retry: 0', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { data: { ok: true } }));
    const client = http(undefined, {
      baseURL: 'https://example.test',
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
    expect(config.headers.Authorization).toBe('Bearer external');
    expect(config.timeout).toBe(0);
    expect(config['axios-retry'].retries).toBe(0);
  });

  it('turns an API error envelope into ResponseError and invokes error hooks', async () => {
    const apiError = { code: 20119, description: 'PIN is incorrect', status: 400, extra: { attempts: 1 } };
    const responseCallback = vi.fn();
    const errorMap = vi.fn();
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { error: apiError }));
    const client = http(undefined, {
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
    const client = http(undefined, {
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
