import { AxiosInstance } from 'axios';
import { AppResponse, UpdateAppRequest } from './types/app';
import { buildClient } from './utils/client';

export const AppKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get user's app share list
  favorites: (userID: string): Promise<AppResponse[]> => axiosInstance.get<unknown, AppResponse[]>(`/users/${userID}/apps/favorite`),

  // Update app setting
  update: (appID: string, params: UpdateAppRequest): Promise<AppResponse> => axiosInstance.post<unknown, AppResponse>(`/apps/${appID}`, params),

  // Add to your share list
  favorite: (appID: string): Promise<AppResponse[]> => axiosInstance.post<unknown, AppResponse[]>(`/apps/${appID}/favorite`),

  // Removing from your share list
  unfavorite: (appID: string): Promise<any> => axiosInstance.post<unknown, any>(`/apps/${appID}/unfavorite`),
});

export const AppClient = buildClient(AppKeystoreClient);

export default AppClient;