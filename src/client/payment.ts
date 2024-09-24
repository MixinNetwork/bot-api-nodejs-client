import type { AxiosInstance } from 'axios';
import type { PaymentRequestResponse, RawTransactionRequest, TransferRequest } from './types';
import { buildClient } from './utils/client';

export const PaymentBaseClient = (axiosInstance: AxiosInstance) => {
  const payment = (params: TransferRequest | RawTransactionRequest) => axiosInstance.post<unknown, PaymentRequestResponse>('/payments', params);
  return {
    /** @deprecated Use payment() instead */
    request: payment,

    // Generate code id for transaction/transfer or verify payments by trace id
    payment,
  };
};

export const PaymentClient = buildClient(PaymentBaseClient);

export default PaymentClient;
