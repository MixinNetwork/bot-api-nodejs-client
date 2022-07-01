import axios, { AxiosResponse } from 'axios';
import { ResponseError } from '../../client';
import { GenerateExtraRequest, RegisteredUser, RegisterRequest } from '../types/bridge';

export const BridgeApi = (uri: string = 'https://bridge.mvm.dev') => {
  const instance = axios.create({ baseURL: uri });
  instance.interceptors.response.use(async (res: AxiosResponse) => {
    const { error } = res.data;
    if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);
    return res.data;
  });
  return {
    // wallet.signMessage(keccak256(toUtf8Bytes(message))).slice(2)
    /**
     * @param params RegisterRequest.public_key - public key of the user, RegisterRequest.signature - signature of the user
     */
    register: async (params: RegisterRequest) => (await instance.post<undefined, { user: RegisteredUser }>('/users', params)).user,
    generateExtra: async (params: GenerateExtraRequest) => `0x${(await instance.post<undefined, { extra: string }>('/extra', params)).extra}`,
  };
};

export default BridgeApi;
