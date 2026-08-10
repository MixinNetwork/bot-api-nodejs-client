import type { Context, WebviewAsset } from './type';

export const WebViewApi = () => {
  const getMixinContext = () => {
    let ctx: Context = {};
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      const contextString = prompt('MixinContext.getContext()');
      if (contextString) {
        ctx = JSON.parse(contextString);
        ctx.platform = ctx.platform || 'iOS';
      }
    } else if (window.MixinContext && typeof window.MixinContext.getContext === 'function') {
      ctx = JSON.parse(window.MixinContext.getContext());
      ctx.platform = ctx.platform || 'Android';
    }

    return ctx;
  };

  return {
    getMixinContext,

    reloadTheme: () => {
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.reloadTheme) window.webkit.messageHandlers.reloadTheme.postMessage('');
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.reloadTheme === 'function') window.MixinContext.reloadTheme();
          break;
        default:
          break;
      }
    },

    playlist: (audios: string[]) => {
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.playlist) window.webkit.messageHandlers.playlist.postMessage(audios);
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.playlist === 'function') window.MixinContext.playlist(audios);
          break;
        default:
          break;
      }
    },

    close: () => {
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.close) window.webkit.messageHandlers.close.postMessage('');
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.close === 'function') window.MixinContext.close();
          break;
        default:
          break;
      }
    },

    getAssets: (assets: string[], cb: (assets: WebviewAsset[]) => void) =>
      new Promise<void>((resolve, reject) => {
        const callbackName = `mixinAssetsCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const callbacks = window as unknown as Record<string, ((response: string) => void) | undefined>;

        callbacks[callbackName] = response => {
          delete callbacks[callbackName];

          try {
            cb(JSON.parse(response) as WebviewAsset[]);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        try {
          if (window.webkit?.messageHandlers?.getAssets) {
            window.webkit.messageHandlers.getAssets.postMessage([assets, callbackName]);
            return;
          }

          if (window.MixinContext && typeof window.MixinContext.getAssets === 'function') {
            window.MixinContext.getAssets(assets, callbackName);
            return;
          }

          delete callbacks[callbackName];
          resolve();
        } catch (error) {
          delete callbacks[callbackName];
          reject(error);
        }
      }),

    getTipAddress: async (chainId: string, cb: (address: string) => void) => {
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.getTipAddress) {
            window.tipAddressCallbackFunction = cb;
            await window.webkit.messageHandlers.getTipAddress.postMessage([chainId, 'tipAddressCallbackFunction']);
          }
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.getTipAddress === 'function') {
            window.tipAddressCallbackFunction = cb;
            await window.MixinContext.getTipAddress(chainId, 'tipAddressCallbackFunction');
          }
          break;
        default:
          break;
      }
    },

    tipSign: async (chainId: string, msg: string, cb: (signature: string) => void) => {
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.tipSign) {
            window.tipSignCallbackFunction = cb;
            await window.webkit.messageHandlers.tipSign.postMessage([chainId, msg, 'tipSignCallbackFunction']);
          }
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.tipSign === 'function') {
            window.tipSignCallbackFunction = cb;
            await window.MixinContext.tipSign(chainId, msg, 'tipSignCallbackFunction');
          }
          break;
        default:
          break;
      }
    },
  };
};
