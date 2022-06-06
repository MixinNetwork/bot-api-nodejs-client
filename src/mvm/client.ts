import axios from 'axios';
import { PaymentRequestResponse } from 'client/types/payment';
import { PaymentRequest, ValueResponse } from './types';

const MVMApiURI = 'https://mvm-api.test.mixinbots.com';

const axiosInstance = axios.create({
  baseURL: MVMApiURI,
});

// Client supplies some APIs for mvm developer
// * POST /payment, generate a payment code url for mixin user
// * POST /values,
//   The maximum memo size in mixin payment is 200, but in many cases the extra length will be greater than 200.
//   We supply a method that put the long extra in contract.
//   Docs: https://mvm.dev/reference/registry.html
export const MVMApi = () => ({
  requestPayment: (params: PaymentRequest): Promise<PaymentRequestResponse> => axiosInstance.post<unknown, PaymentRequestResponse>('/payment', params),
  writeValue: (key: string, value: string, address: string): Promise<ValueResponse> => axiosInstance.post<unknown, ValueResponse>('/values', { key, value, address }),
});