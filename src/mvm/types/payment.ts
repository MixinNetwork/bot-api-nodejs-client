export interface OpponentMultisigRequest {
  receivers: string[];
  threshold: number;
}

export interface PaymentRequest {
  asset_id: string;
  amount: string;
  trace_id: string;
  memo: string;
  opponent_multisig: OpponentMultisigRequest;
}