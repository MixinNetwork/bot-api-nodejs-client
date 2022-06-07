import { AxiosInstance } from 'axios';
import { buildClient } from './utils/client';
import { PaymentRequestResponse, RawTransactionRequest, TransferRequest } from './types';

export const PaymentBaseClient = (axiosInstance: AxiosInstance) => ({
  // Generate code id for transaction/transfer or verify payments by trace id
  request: (params: TransferRequest | RawTransactionRequest) => axiosInstance.post<unknown, PaymentRequestResponse>('/payments', params),
});

export const PaymentClient = buildClient(PaymentBaseClient);

export default PaymentClient;