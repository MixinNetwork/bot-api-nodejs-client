import { AxiosInstance } from 'axios';
import { DepositRequest, ExternalTransactionResponse, CheckAddressRequest, CheckAddressResponse, ExchangeRateResponse } from './types/external';
import { buildClient } from './utils/client';

export const ExternalKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get the pending deposits
  // Which confirmations is less then threshold
  deposits: (params: DepositRequest): Promise<ExternalTransactionResponse[]> => axiosInstance.get<unknown, ExternalTransactionResponse[]>('/external/transactions', { params }),

  // Check if an address belongs to Mixin
  checkAddress: (params: CheckAddressRequest): Promise<CheckAddressResponse> => axiosInstance.get<unknown, CheckAddressResponse>(`/external/addresses/check`, { params }),

  // GET the list of all fiat exchange rates based on US Dollar
  exchangeRates: (): Promise<ExchangeRateResponse[]> => axiosInstance.get<unknown, ExchangeRateResponse[]>('/external/fiats')
});

export const ExternalClient = buildClient(ExternalKeystoreClient);

export default ExternalClient;