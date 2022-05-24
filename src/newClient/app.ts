import { AxiosInstance } from 'axios';
import { AppResponse, AppRequest } from './types/app';
import { buildClient } from './utils/client';

// TODO add app api for developer document
// https://developers.mixin.one/
export const AppKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get user's app share list
  favorites: (userID: string): Promise<AppResponse[]> => axiosInstance.get<unknown, AppResponse[]>(`/users/${userID}/apps/favorite`),

  // Update app setting
  update: (appID: string, params: AppRequest): Promise<AppResponse> => axiosInstance.post<unknown, AppResponse>(`/apps/${appID}`, params),

  // Add to your share list
  favorite: (appID: string): Promise<AppResponse[]> => axiosInstance.post<unknown, AppResponse[]>(`/apps/${appID}/favorite`),

  // Removing from your share list
  unfavorite: (appID: string): Promise<any> => axiosInstance.post<unknown, any>(`/apps/${appID}/unfavorite`),

  // TODO for developer dashboard
  // post /apps
  // post /apps/:id/secret
  // post /apps/:id/session
  // get /apps
  // get /apps/property
});

export const AppClient = buildClient(AppKeystoreClient);

export default AppClient;
