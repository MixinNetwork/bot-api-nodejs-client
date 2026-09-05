import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import type { AppKeystore } from '../../src/client/types';
import { buildClient } from '../../src/client/utils/client';

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
    const DomainClient = (axios: AxiosInstance, credentials?: AppKeystore) => ({
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
  });

  it('rejects a missing domain client', () => {
    const Client = buildClient(undefined as never);

    expect(() => Client()).toThrow('keystore client is required');
  });
});
