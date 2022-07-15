import axios, { AxiosResponse } from 'axios';
import { PaymentRequestResponse } from '../client';
import { PaymentRequest, ValueResponse } from './types';
import ResponseError from '../client/error';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.get['Content-Type'] = 'application/json';
/**
 * Client supplies some APIs for mvm developer
 * * POST /payment, generate a payment code url for mixin user
 * * POST /values,
 * The maximum memo size in mixin payment is 200, but in many cases the extra length will be greater than 200.
 * We supply a method that put the long extra in contract.
 * Docs: https://mvm.dev/reference/registry.html
 */
export const MVMApi = (uri: string) => {
  const instance = axios.create({
    baseURL: uri,
  });

  instance.interceptors.response.use(
    async (res: AxiosResponse) => {
      const { error } = res.data;
      if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);
      return res.data;
    },
    err => {
      throw new Error(`${err.response.status}, ${err.response.statusText}`);
    },
  );

  return {
    payments: (params: PaymentRequest): Promise<PaymentRequestResponse> => instance.post<unknown, PaymentRequestResponse>('/payments', params),
    writeValue: (key: string, value: string, address: string): Promise<ValueResponse> => instance.post<unknown, ValueResponse>('/values', { key, value, address }),
  };
};
