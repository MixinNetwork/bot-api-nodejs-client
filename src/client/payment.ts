import { AxiosInstance } from 'axios';
import { buildClient } from './utils/client';
import { PaymentRequestResponse, RawTransactionRequest, TransferRequest } from './types';
import { MVMMainnet, encodeMemo } from '../mvm';

export const PaymentBaseClient = (axiosInstance: AxiosInstance) => ({
  // Generate code id for transaction/transfer or verify payments by trace id
  request: (params: TransferRequest | RawTransactionRequest, process = MVMMainnet.Registry.PID) => {
    const paymentRequest = {...params};
    if (paymentRequest.memo && paymentRequest.memo.slice(0, 2) === '0x') {
      paymentRequest.memo = encodeMemo(paymentRequest.memo.slice(2), process);
    }
    return axiosInstance.post<unknown, PaymentRequestResponse>('/payments', paymentRequest);
  },
});

export const PaymentClient = buildClient(PaymentBaseClient);

export default PaymentClient;