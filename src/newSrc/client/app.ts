import { AxiosInstance } from 'axios';
import { request } from 'services/request';
import { App, UpdateAppRequest } from 'types';
import { BaseClient } from '../types';

export const AppTokenClient = (axiosInstance: AxiosInstance) => ({
  updateApp: (appID: string, params: UpdateAppRequest) => axiosInstance.post<unknown, App>(`/apps/${appID}`, params),
  readFavoriteApps: (userID: string) => axiosInstance.get<unknown, App[]>(`/users/${userID}/apps/favorite`),
  favoriteApp: (appID: string) => axiosInstance.post<unknown, App>(`/apps/${appID}/favorite`),
  unfavoriteApp: (appID: string) => axiosInstance.post<unknown, void>(`/apps/${appID}/unfavorite`),
});

export const AppClient: BaseClient<ReturnType<typeof AppTokenClient>, ReturnType<typeof AppTokenClient>> = (arg: any): any => AppTokenClient(request(arg));
