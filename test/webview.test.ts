import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebViewApi } from '../src/webview';

const assets = [
  {
    asset_id: '43d61dcd-e413-450d-80b8-101d5e903357',
    balance: '1',
    chain_id: '43d61dcd-e413-450d-80b8-101d5e903357',
    icon_url: '',
    name: 'Ethereum',
    symbol: 'ETH',
  },
];

type TestWindow = Window & Record<string, unknown>;

describe('WebViewApi.getAssets', () => {
  let testWindow: TestWindow;

  beforeEach(() => {
    testWindow = {} as TestWindow;
    Object.assign(globalThis, { window: testWindow });
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('waits for the Android callback and preserves the bridge receiver', async () => {
    let callbackName = '';
    const bridge = {
      getAssets(this: unknown, assetIDs: string[], callback: string) {
        expect(this).toBe(bridge);
        expect(assetIDs).toEqual(['asset-id']);
        callbackName = callback;
      },
    };
    testWindow.MixinContext = bridge;
    const callback = vi.fn();

    const completion = WebViewApi().getAssets(['asset-id'], callback);

    expect(callback).not.toHaveBeenCalled();
    expect(callbackName).toMatch(/^mixinAssetsCallback_\d+_[a-z0-9]+$/);

    const nativeCallback = testWindow[callbackName] as (response: string) => void;
    nativeCallback(JSON.stringify(assets));

    await expect(completion).resolves.toBeUndefined();
    expect(callback).toHaveBeenCalledWith(assets);
    expect(testWindow[callbackName]).toBeUndefined();
  });

  it('uses the iOS handler without requiring a MixinContext response first', async () => {
    let callbackName = '';
    testWindow.webkit = {
      messageHandlers: {
        getAssets: {
          postMessage: ([assetIDs, callback]) => {
            expect(assetIDs).toEqual(['asset-id']);
            callbackName = callback;
          },
        },
      },
    };
    const callback = vi.fn();

    const completion = WebViewApi().getAssets(['asset-id'], callback);

    expect(callbackName).toMatch(/^mixinAssetsCallback_\d+_[a-z0-9]+$/);

    const nativeCallback = testWindow[callbackName] as (response: string) => void;
    nativeCallback(JSON.stringify(assets));

    await expect(completion).resolves.toBeUndefined();
    expect(callback).toHaveBeenCalledWith(assets);
    expect(testWindow[callbackName]).toBeUndefined();
  });
});
