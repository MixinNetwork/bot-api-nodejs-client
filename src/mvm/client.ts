import axios from 'axios';
import { ValueResponse } from './types/value';
import { PaymentRequest, PaymentResponse } from './types/payment';

const MVMApiURI = 'https://mvm-api.test.mixinbots.com';

const MVMApiClient = axios.create({
  baseURL: MVMApiURI,
});


export const Client = () => ({
  writeValue: (key: string, value: string, address: string): Promise<ValueResponse> => MVMApiClient.post<unknown, ValueResponse>('/values', { key, value, address }),
  payment: (params: PaymentRequest): Promise<PaymentResponse> => MVMApiClient.post<unknown, PaymentResponse>('/payment', params),
});
