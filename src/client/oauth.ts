import { AxiosInstance } from 'axios';
import { AccessTokenRequest, AccessTokenResponse, AuthorizationResponse, AuthorizeRequest } from './types/oauth';
import { buildClient } from './utils/client';

/**
 * Method to get user access code
 * To access some information of Mixin Messenger users, the developer needs to apply for authorization from the user
 * After that, the page will automatically jump to the application's OAuth URL, accompanied by the authorization code
 * Detail: https://developers.mixin.one/docs/api/oauth/oauth
 */
export const OAuthBaseClient = (axiosInstance: AxiosInstance) => ({
  /** Get the access code based on authorization code */
  getToken: (data: AccessTokenRequest) => axiosInstance.post<unknown, AccessTokenResponse>('/oauth/token', data),

  authorize: (data: AuthorizeRequest) => axiosInstance.post<unknown, AuthorizationResponse>('/oauth/authorize', data),

  authorizations: (appId?: string) => axiosInstance.get<unknown, AuthorizationResponse[]>('/authorizations', { params: { app: appId } }),

  revokeAuthorize: (clientId: string) => axiosInstance.post<unknown, void>('/oauth/cancel', { client_id: clientId }),
});

export const OAuthClient = buildClient(OAuthBaseClient);

export default OAuthClient;
