export interface Context {
  app_version?: string;
  immersive?: boolean;
  appearance?: 'light' | 'dark';
  currency?: string;
  locale?: string;
  platform?: 'iOS' | 'Android' | 'Desktop';
  conversation_id?: string;
}

export interface WebviewAsset {
  asset_id: string;
  balance: string;
  chain_id: string;
  icon_url: string;
  name: string;
  symbol: string;
}

export interface Messengers {
  getContext: (args?: string) => string;
  playlist: (audio: string[]) => any;
  reloadTheme: (args?: string) => void;
  close: (args?: string) => void;
  getAssets: (assets: string[], globalCallBackFuncName: string) => void;
  getTipAddress: (chainId: string, globalCallBackFuncName: string) => void;
  tipSign: (chainId: string, message: string, globalCallBackFuncName: string) => void;
}

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        MixinContext?: { postMessage: Messengers['getContext'] };
        playlist?: { postMessage: Messengers['playlist'] };
        reloadTheme?: { postMessage: Messengers['reloadTheme'] };
        close?: { postMessage: Messengers['close'] };
        getAssets?: { postMessage: ([params, globalCallBackFuncName]: [string[], string]) => void };
        getTipAddress?: { postMessage: ([chainId, globalCallBackFuncName]: [string, string]) => void };
        tipSign?: { postMessage: ([chainId, message, globalCallBackFuncName]: [string, string, string]) => void };
      };
    };
    MixinContext?: {
      getContext?: Messengers['getContext'];
      reloadTheme?: Messengers['reloadTheme'];
      playlist?: Messengers['playlist'];
      close?: Messengers['close'];
      getAssets?: Messengers['getAssets'];
      getTipAddress?: Messengers['getTipAddress'];
      tipSign?: Messengers['tipSign'];
    };
    assetsCallbackFunction?: (res: WebviewAsset[]) => void;
    tipAddressCallbackFunction?: (address: string) => void;
    tipSignCallbackFunction?: (signature: string) => void;
  }
}
