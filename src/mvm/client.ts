import axios, {AxiosResponse} from 'axios';
import { ResponseError, PaymentRequestResponse } from '../client';
import { PaymentRequest, ValueResponse } from './types';

// Client supplies some APIs for mvm developer
// * POST /payment, generate a payment code url for mixin user
// * POST /values,
//   The maximum memo size in mixin payment is 200, but in many cases the extra length will be greater than 200.
//   We supply a method that put the long extra in contract.
//   Docs: https://mvm.dev/reference/registry.html
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.get['Content-Type'] = 'application/json';
export const MVMApi = (uri: string) => {
  const instance = axios.create({
    baseURL: uri,
  });

  instance.interceptors.response.use(
    async (res: AxiosResponse) => {
      const { data, error } = res.data;
      if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['X-Request-Id'], error);
      return data;
    }
  );

  return {
    payments: (params: PaymentRequest): Promise<PaymentRequestResponse> => instance.post<unknown, PaymentRequestResponse>('/payments', params),
    writeValue: (key: string, value: string, address: string): Promise<ValueResponse> => instance.post<unknown, ValueResponse>('/values', { key, value, address }),
  };
};