import axios, { AxiosResponse } from 'axios';
import { PreOrderResponse } from '../types';
import ResponseError from '../error';

const instance = axios.create({ baseURL: 'https://api.4swap.org/api' });
instance.interceptors.response.use(async (res: AxiosResponse) => {
  const { error } = res.data;
  if (error) throw new ResponseError(error.code, error.description, error.status, error.extra, res.headers['x-request-Id'], error);
  return res.data;
});

export const fetch4SwapPreOrder = (from: string, to: string, toAmount: string): Promise<PreOrderResponse> =>
  instance.post<undefined, PreOrderResponse>('/orders/pre', {
    pay_asset_id: from,
    fill_asset_id: to,
    amount: toAmount,
  });
