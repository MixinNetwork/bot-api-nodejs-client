import { AxiosInstance } from 'axios';
import { DepositRequest, ProxyRequest } from './types/external';
import { CheckAddressRequest, CheckAddressResponse, ExchangeRateResponse, ExternalTransactionResponse } from './types/network';
import { buildClient } from './utils/client';

export const ExternalKeystoreClient = (axiosInstance: AxiosInstance) => ({
  /**
   * Get the pending deposits
   * Which confirmations is less then threshold
   */
  deposits: (params: DepositRequest): Promise<ExternalTransactionResponse[]> => axiosInstance.get<unknown, ExternalTransactionResponse[]>('/external/transactions', { params }),

  /**
   * Check if an address belongs to Mixin
   */
  checkAddress: (params: CheckAddressRequest): Promise<CheckAddressResponse> => axiosInstance.get<unknown, CheckAddressResponse>(`/external/addresses/check`, { params }),

  /**
   * GET the list of all fiat exchange rates based on US Dollar
   */
  exchangeRates: (): Promise<ExchangeRateResponse[]> => axiosInstance.get<unknown, ExchangeRateResponse[]>('/external/fiats'),

  /**
   * Submit a raw transaction to a random mainnet node
   *   {
   *     method: 'sendrawtransaction',
   *     params: array of transaction hash
   *   }
   * */
  proxy: (params: ProxyRequest): Promise<any> => axiosInstance.post<unknown, any>('/external/proxy', params),
});

export const ExternalClient = buildClient(ExternalKeystoreClient);

export default ExternalClient;
