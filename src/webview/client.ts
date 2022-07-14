import { Context } from './type';

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
  };
};
