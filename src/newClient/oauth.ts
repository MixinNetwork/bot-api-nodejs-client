import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AccessTokenResponse } from './types/oauth';
import { buildClient } from "./utils/client";

export const OAuthKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
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