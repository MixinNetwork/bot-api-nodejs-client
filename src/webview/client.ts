import type { Context, WebviewAsset } from './type';

export const WebViewApi = () => {
  const getMixinContext = () => {
    let ctx: Context = {};
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      const contextString = prompt('MixinContext.getContext()'); // eslint-disable-line no-alert
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

    getAssets: async (assets: string[], cb: (assets: WebviewAsset[]) => void) => {
      const cbf = (str: string) => {
        const assets = JSON.parse(str) as WebviewAsset[];
        cb(assets);
      };
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.getAssets) {
            window.assetsCallbackFunction = cbf;
            await window.webkit.messageHandlers.getAssets.postMessage([assets, 'assetsCallbackFunction']);
          }
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.getAssets === 'function') {
            window.assetsCallbackFunction = cbf;
            await window.MixinContext.getAssets(assets, 'assetsCallbackFunction');
          }
          break;
        default:
          break;
      }
    },

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

    signBotSignature: (appId: string, reloadPublicKey: boolean, method: string, path: string, body: string, callbackFunction: string) => {
      switch (getMixinContext().platform) {
        case 'iOS':
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.signBotSignature) {
            window.webkit.messageHandlers.signBotSignature.postMessage([appId, reloadPublicKey, method, path, body, callbackFunction]);
          }
          break;
        case 'Android':
        case 'Desktop':
          if (window.MixinContext && typeof window.MixinContext.signBotSignature === 'function') {
            window.MixinContext.signBotSignature([appId, reloadPublicKey, method, path, body, callbackFunction]);
          }
          break;
        default:
          break;
      }
    },
  };
};
