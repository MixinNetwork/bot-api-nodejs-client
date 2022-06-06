export interface OpponentMultisigRequest {
  receivers: string[];
  threshold: number;
}

export interface PaymentRequest {
  asset_id: string;
  amount: string;
  trace: string;
  extra: string;
  opponent_multisig: OpponentMultisigRequest;
}

export interface PaymentCodeResponse {
  code_url: string;
}