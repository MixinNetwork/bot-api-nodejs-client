import { AxiosInstance } from 'axios';
import { AccessTokenResponse } from './types/oauth';
import { buildClient } from './utils/client';

/**
 * Method to get user access code
 * To access some information of Mixin Messenger users, the developer needs to apply for authorization from the user
 * After that, the page will automatically jump to the application's OAuth URL, accompanied by the authorization code
 * Detail: https://developers.mixin.one/docs/api/oauth/oauth
 */
export const OAuthBaseClient = (axiosInstance: AxiosInstance) => ({
  /** Get the access code based on authorization code */
  getToken: (client_id: string, code: string, ed25519: string, client_secret?: string, code_verifier?: string): Promise<AccessTokenResponse> => {
    const data = {
      client_id,
      client_secret,
      code,
      ed25519,
      code_verifier,
    };
    return axiosInstance.post<unknown, AccessTokenResponse>('/oauth/token', data);
  },
});

export const OAuthClient = buildClient(OAuthBaseClient);

export default OAuthClient;
