import axios from 'axios';
import { PaymentRequest, PaymentResponse } from './types/payment';
import { ValueResponse } from './types/value';

const MVMApiURI = 'https://mvm-api.test.mixinbots.com';

const MVMApiClient = axios.create({
  baseURL: MVMApiURI,
});

// Client supplies some APIs for mvm developer
// * POST /payment, generate a payment code url for mixin user
// * POST /values,
//   The maximum memo size in mixin payment is 200, but in many cases the extra length will be greater than 200.
//   We supplies a method that put the long extra in constract.
//   Docs: https://mvm.dev/reference/registry.html
export const Client = () => ({
  payment: (params: PaymentRequest): Promise<PaymentResponse> => MVMApiClient.post<unknown, PaymentResponse>('/payment', params),
  writeValue: (key: string, value: string, address: string): Promise<ValueResponse> => MVMApiClient.post<unknown, ValueResponse>('/values', { key, value, address }),
});
