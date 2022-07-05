import axios, { AxiosResponse } from 'axios';
import { ResponseError } from 'client/error';
import { GenerateExtraRequest, RegisteredUser, RegisterRequest } from 'mvm/types/bridge';

export const BridgeApi = (uri: string = 'https://bridge.mvm.dev') => {
  const instance = axios.create({ baseURL: uri });
  instance.interceptors.response.use(async (res: AxiosResponse) => {
    const { error } = res.data;
    if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);
    return res.data;
  });
  return {
    /**
     * signature: signature of the user.
     * example: wallet.signMessage(keccak256(toUtf8Bytes(`MVM:Bridge:Proxy:${server_public_key_base64}:${address}`))).slice(2)
     */
    register: async (params: RegisterRequest) => (await instance.post<undefined, { user: RegisteredUser }>('/users', params)).user,
    /**
     * destination: string, btc address (3MzLbnrkL8HV5tbuo....z8qMyBw7R33) or eos account name (eoswithmixin)
     * tag: string, like eos memo
     * receivers: []string, mixin user id set
     * threshold: Number
     * extra: string
     * all params are optional
     */
    generateExtra: async (params: GenerateExtraRequest) => `0x${(await instance.post<undefined, { extra: string }>('/extra', params)).extra}`,
  };
};

export default BridgeApi;
