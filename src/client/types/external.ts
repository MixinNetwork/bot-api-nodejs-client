export interface CheckAddressRequest {
  asset: string;
  destination: string;
  tag?: string;
}

export interface CheckAddressResponse {
  destination: string;
  tag: string;
}

export interface DepositRequest {
  asset?: string;
  destination?: string;
  tag?: string;
  order?: string;
  offset?: string;
  limit?: number;
}

export interface ExchangeRateResponse {
  code: string;
  rate: string;
}

export interface ExternalTransactionResponse {
  transaction_id: string;
  created_at: string;
  transaction_hash: string;
  sender: string;
  chain_id: string;
  asset_id: string;
  amount: string;
  destination: string;
  tag: string;
  confirmations: string;
  threshold: string;
}

export interface ProxyRequest {
  method: string;
  params: any[];
}
