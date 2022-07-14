export interface TransferRequest {
  asset_id: string;
  opponent_id: string;
  amount?: string;
  trace_id?: string;
  memo?: string;

  pin?: string;
}
