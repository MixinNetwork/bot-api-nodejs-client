export interface WithdrawalRequest {
  address_id: string;
  amount: string;
  pin_base64?: string;
  fee?: string;
  trace_id?: string;
  memo?: string;
}
