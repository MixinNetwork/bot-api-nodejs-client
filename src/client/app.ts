import type { AxiosInstance } from 'axios';
import type {
  AppResponse,
  AppPropertyResponse,
  AppRequest,
  AppSafeSessionRequest,
  AppSafeRegistrationRequest,
  AppSessionResponse,
  AppRegistrationResponse,
  AppSecretResponse,
  AppBillingResponse,
} from './types/app';
import { Keystore } from './types';
import { buildClient } from './utils/client';
import { getOwnershipTransferTipBody, signEd25519PIN, signTipBody } from './utils';

// TODO add app api for developer document
/**
 * API for mixin users and official app
 * Notes:
 * * Some api only available for mixin official app
 * * Each Mixin user can only create two free apps
 * https://developers.mixin.one/
 */
export const AppKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  /** Get information of current user's a specific app */
  fetch: (appID: string): Promise<AppResponse> => axiosInstance.get<unknown, AppResponse>(`/apps/${appID}`),

  /**
   * Get app list of current user
   * Available for mixin official developer app only
   */
  fetchList: (): Promise<AppResponse[]> => axiosInstance.get<unknown, AppResponse[]>(`/apps`),

  /**
   * Get app number of current user and the price to buy new credit
   * Available for mixin official developer app only
   */
  properties: (): Promise<AppPropertyResponse> => axiosInstance.get<unknown, AppPropertyResponse>(`/apps/property`),

  /** Get app billing */
  billing: (appID: string): Promise<AppBillingResponse> => axiosInstance.get<unknown, AppBillingResponse>(`/safe/apps/${appID}/billing`),

  /** Get user's app share list */
  favorites: (userID: string): Promise<AppResponse[]> => axiosInstance.get<unknown, AppResponse[]>(`/users/${userID}/apps/favorite`),

  /** Developer can create up to 2 free apps, or pay for more unlimited apps */
  create: (params: AppRequest): Promise<AppResponse> => axiosInstance.post<unknown, AppResponse>(`/apps`, params),

  /** Update app setting */
  update: (appID: string, params: AppRequest): Promise<AppResponse> => axiosInstance.post<unknown, AppResponse>(`/apps/${appID}`, params),

  /** Get a new app secret */
  updateSecret: (appID: string): Promise<AppSecretResponse> => axiosInstance.post<unknown, AppSecretResponse>(`/apps/${appID}/secret`),

  /**
   * Get a new app session
   * @param session_public_key: public key of ed25519 session keys
   */
  updateSafeSession: (appID: string, data: AppSafeSessionRequest): Promise<AppSessionResponse> =>
    axiosInstance.post<unknown, AppSessionResponse>(`/safe/apps/${appID}/session`, data),

  /**
   * Register app to safe, the spend private key would be the same as the tip private key
   * @param spend_public_key: hex public key of ed25519 tip/spend keys
   * @param signature_base64: signature of the SHA256Hash of the app_id using ed25519 tip/spend private key
   */
  registerSafe: (appID: string, data: AppSafeRegistrationRequest): Promise<AppRegistrationResponse> =>
    axiosInstance.post<unknown, AppRegistrationResponse>(`/safe/apps/${appID}/register`, data),

  /**
   * Add to your share list
   * User can have up to 3 favorite apps
   */
  favorite: (appID: string): Promise<AppResponse[]> => axiosInstance.post<unknown, AppResponse[]>(`/apps/${appID}/favorite`),

  /** Removing from your share list */
  unfavorite: (appID: string): Promise<any> => axiosInstance.post<unknown, any>(`/apps/${appID}/unfavorite`),

  // Migrate app to receiver id with the keystore of this app
  // pin is the spend private key of this app
  migrate: (pin: string, receiverID: string) => {
    if (!keystore) throw new Error('invalid keystore to migrate app');
    const msg = getOwnershipTransferTipBody(receiverID);
    const signedTipPin = signTipBody(pin, msg);
    const pin_base64 = signEd25519PIN(signedTipPin, keystore);
    return axiosInstance.post<unknown, AppResponse>(`/apps/${keystore.app_id}/transfer`, {
      pin_base64,
      user_id: receiverID,
    });
  },
});

export const AppClient = buildClient(AppKeystoreClient);

export default AppClient;
