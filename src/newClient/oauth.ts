import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AccessTokenResponse } from './types/oauth';
import { buildClient } from './utils/client';

// Method to get user access code
// To access some information of Mixin Messenger users, the developer needs to apply for authorization from the user
// After that, the page will automatically jump to the application's OAuth URL, accompanied by the authorization code
// Detail: https://developers.mixin.one/docs/api/oauth/oauth
export const OAuthKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Get the access code based on authorization code
  getToken: (code: string): Promise<AccessTokenResponse> => {
    if (!keystore || !keystore.user_id || !keystore.client_secret) {
      throw new Error('Invalid keystore!');
    }

    const data = {
      client_id: keystore!.user_id,
      client_secret: keystore!.client_secret,
      code
    };
    return axiosInstance.post<unknown, AccessTokenResponse>('/oauth/token', data);
  }
});

export const OAuthClient = buildClient(OAuthKeystoreClient);

export default OAuthClient;