import { AxiosInstance } from 'axios';
import { DepositRequest, ExternalTransactionResponse, CheckAddressRequest, CheckAddressResponse, ExchangeRateResponse } from './types/external';
import { buildClient } from './utils/client';

export const ExternalKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get public network-wide deposit records
  deposit: (params: DepositRequest): Promise<ExternalTransactionResponse[]> => axiosInstance.get<unknown, ExternalTransactionResponse[]>('/external/transactions', { params }),

  // Check if an address belongs to Mixin
  externalAddressesCheck: (params: CheckAddressRequest): Promise<CheckAddressResponse> => axiosInstance.get(`/external/addresses/check`, { params }),

  // GET the list of all fiat exchange rates based on US Dollar
  exchangeRates: (): Promise<ExchangeRateResponse> => axiosInstance.get<unknown, ExchangeRateResponse>('/external/fiats')
});

export const ExternalClient = buildClient(ExternalKeystoreClient);

export default ExternalClient;