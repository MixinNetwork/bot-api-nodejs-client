import { AxiosInstance } from 'axios';
import { AppResponse, UpdateAppRequest } from './types/app';
import { buildClient } from "./utils/client";

export const AppKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get user's app share list
  favorites: (userID: string) => axiosInstance.get<unknown, AppResponse[]>(`/users/${userID}/apps/favorite`),

  // Update app setting
  update: (appID: string, params: UpdateAppRequest) => axiosInstance.post<unknown, AppResponse>(`/apps/${appID}`, params),

  // Add to your share list
  favorite: (appID: string) => axiosInstance.post<unknown, AppResponse[]>(`/apps/${appID}/favorite`),

  // Removing from your share list
  unfavorite: (appID: string) => axiosInstance.post<unknown, any>(`/apps/${appID}/unfavorite`),
});

export const AppClient = buildClient({
  KeystoreClient: AppKeystoreClient,
});

export default AppClient;
