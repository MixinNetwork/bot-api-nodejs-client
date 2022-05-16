import { AxiosInstance } from 'axios';
import { App, UpdateAppRequest } from 'types';

export function AppClient(axiosInstance: AxiosInstance) {
  return {
    updateApp: (appID: string, params: UpdateAppRequest) => axiosInstance.post<unknown, App>(`/apps/${appID}`, params),
    readFavoriteApps: (userID: string) => axiosInstance.get<unknown, App[]>(`/users/${userID}/apps/favorite`),
    favoriteApp: (appID: string) => axiosInstance.post<unknown, App>(`/apps/${appID}/favorite`),
    unfavoriteApp: (appID: string) => axiosInstance.post<unknown, void>(`/apps/${appID}/unfavorite`),
  };
}
