export interface DepositRequest {
  asset?: string;
  destination?: string;
  tag?: string;
  order?: 'ASC' | 'DESC';
  offset?: string;
  limit?: number;
  user?: string;
}

export interface ProxyRequest {
  method: string;
  params: any[];
}
