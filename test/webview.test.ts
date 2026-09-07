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
    delete (globalThis as { prompt?: unknown }).prompt;
    vi.restoreAllMocks();
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

  it('resolves and removes its callback when no native bridge is available', async () => {
    const callback = vi.fn();

    await expect(WebViewApi().getAssets(['asset-id'], callback)).resolves.toBeUndefined();

    expect(callback).not.toHaveBeenCalled();
    expect(Object.keys(testWindow)).toEqual([]);
  });

  it('rejects invalid native responses and removes its callback', async () => {
    let callbackName = '';
    testWindow.MixinContext = {
      getAssets(_assetIDs: string[], callback: string) {
        callbackName = callback;
      },
    };

    const completion = WebViewApi().getAssets(['asset-id'], vi.fn());
    const nativeCallback = testWindow[callbackName] as (response: string) => void;
    nativeCallback('{invalid json');

    await expect(completion).rejects.toBeInstanceOf(SyntaxError);
    expect(testWindow[callbackName]).toBeUndefined();
  });

  it('rejects bridge errors and removes its callback', async () => {
    testWindow.MixinContext = {
      getAssets() {
        throw new Error('bridge failed');
      },
    };

    const completion = WebViewApi().getAssets(['asset-id'], vi.fn());

    await expect(completion).rejects.toThrow('bridge failed');
    expect(Object.keys(testWindow)).toEqual(['MixinContext']);
  });

  it('rejects when the consumer callback throws', async () => {
    let callbackName = '';
    testWindow.MixinContext = {
      getAssets(_assetIDs: string[], callback: string) {
        callbackName = callback;
      },
    };
    const completion = WebViewApi().getAssets(['asset-id'], () => {
      throw new Error('consumer failed');
    });

    (testWindow[callbackName] as (response: string) => void)(JSON.stringify(assets));

    await expect(completion).rejects.toThrow('consumer failed');
    expect(testWindow[callbackName]).toBeUndefined();
  });
});

describe('WebViewApi bridge routing', () => {
  let testWindow: TestWindow;

  beforeEach(() => {
    testWindow = {} as TestWindow;
    Object.assign(globalThis, { window: testWindow });
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { prompt?: unknown }).prompt;
    vi.restoreAllMocks();
  });

  it('reads Android context and supplies the default platform', () => {
    const bridge = {
      getContext: vi.fn(() => JSON.stringify({ app_version: '1.0.0' })),
    };
    testWindow.MixinContext = bridge;

    expect(WebViewApi().getMixinContext()).toEqual({ app_version: '1.0.0', platform: 'Android' });
    expect(bridge.getContext).toHaveBeenCalledOnce();
  });

  it('reads iOS context from prompt and supplies the default platform', () => {
    testWindow.webkit = { messageHandlers: { MixinContext: {} } };
    const prompt = vi.fn(() => JSON.stringify({ conversation_id: 'conversation-id' }));
    Object.assign(globalThis, { prompt });

    expect(WebViewApi().getMixinContext()).toEqual({ conversation_id: 'conversation-id', platform: 'iOS' });
    expect(prompt).toHaveBeenCalledWith('MixinContext.getContext()');
  });

  it('routes theme, playlist, close, tip address, and signing calls to Android', async () => {
    const bridge = {
      getContext: () => JSON.stringify({ platform: 'Android' }),
      reloadTheme: vi.fn(),
      playlist: vi.fn(),
      close: vi.fn(),
      getTipAddress: vi.fn(),
      tipSign: vi.fn(),
    };
    testWindow.MixinContext = bridge;
    const api = WebViewApi();
    const addressCallback = vi.fn();
    const signCallback = vi.fn();

    api.reloadTheme();
    api.playlist(['one.mp3']);
    api.close();
    await api.getTipAddress('chain-id', addressCallback);
    await api.tipSign('chain-id', 'message', signCallback);

    expect(bridge.reloadTheme).toHaveBeenCalledOnce();
    expect(bridge.playlist).toHaveBeenCalledWith(['one.mp3']);
    expect(bridge.close).toHaveBeenCalledOnce();
    expect(bridge.getTipAddress).toHaveBeenCalledWith('chain-id', 'tipAddressCallbackFunction');
    expect(bridge.tipSign).toHaveBeenCalledWith('chain-id', 'message', 'tipSignCallbackFunction');
    expect(testWindow.tipAddressCallbackFunction).toBe(addressCallback);
    expect(testWindow.tipSignCallbackFunction).toBe(signCallback);
  });

  it('routes commands to iOS handlers', async () => {
    const handlers = {
      MixinContext: {},
      reloadTheme: { postMessage: vi.fn() },
      playlist: { postMessage: vi.fn() },
      close: { postMessage: vi.fn() },
      getTipAddress: { postMessage: vi.fn() },
      tipSign: { postMessage: vi.fn() },
    };
    testWindow.webkit = { messageHandlers: handlers };
    Object.assign(globalThis, { prompt: vi.fn(() => JSON.stringify({ platform: 'iOS' })) });
    const api = WebViewApi();

    api.reloadTheme();
    api.playlist(['one.mp3']);
    api.close();
    await api.getTipAddress('chain-id', vi.fn());
    await api.tipSign('chain-id', 'message', vi.fn());

    expect(handlers.reloadTheme.postMessage).toHaveBeenCalledWith('');
    expect(handlers.playlist.postMessage).toHaveBeenCalledWith(['one.mp3']);
    expect(handlers.close.postMessage).toHaveBeenCalledWith('');
    expect(handlers.getTipAddress.postMessage).toHaveBeenCalledWith(['chain-id', 'tipAddressCallbackFunction']);
    expect(handlers.tipSign.postMessage).toHaveBeenCalledWith(['chain-id', 'message', 'tipSignCallbackFunction']);
  });
});
