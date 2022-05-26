export interface WithdrawalRequest {
  address_id: string;
  amount: string;
  trace_id?: string;

  memo?: string;
  pin?: string;
}