import { AxiosInstance } from 'axios';
import { AppResponse, UpdateAppRequest } from './types/app';
import { buildClient } from "./utils/client";

// Methods to manage your app share list
export const AppTokenClient = (axiosInstance: AxiosInstance) => ({
  // Get user's app share list
  index: (userID: string) => axiosInstance.get<unknown, AppResponse[]>(`/users/${userID}/apps/favorite`),
});

export const AppKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Update app setting
  update: (appID: string, params: UpdateAppRequest) => axiosInstance.post<unknown, AppResponse>(`/apps/${appID}`, params),

  // Add to your share list
  favorite: (appID: string) => axiosInstance.post<unknown, AppResponse[]>(`/apps/${appID}/favorite`),

  // Removing from your share list
  unfavorite: (appID: string) => axiosInstance.post<unknown, any>(`/apps/${appID}/unfavorite`),
});

export const AppClient = buildClient({
  TokenClient: AppTokenClient,
  KeystoreClient: AppKeystoreClient,
});

export default AppClient;