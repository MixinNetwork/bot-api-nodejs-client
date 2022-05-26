export interface WithdrawRequest {
  address_id: string;
  amount: string;
  trace_id?: string;

  memo?: string;
  pin?: string;
}