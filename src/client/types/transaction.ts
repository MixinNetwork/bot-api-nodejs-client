export interface RawTransactionRequest {
  asset_id: string;
  amount?: string;
  trace_id?: string;
  memo?: string;
  /** OpponentKey used for raw transaction */
  opponent_key?: string;
  opponent_multisig?: {
    receivers: string[];
    threshold: number;
  };

  pin?: string;
}

export interface GhostInputRequest {
  receivers: string[];
  index: number;
  hint?: string;
}

export interface GhostKeysResponse {
  type: 'ghost_key';
  keys: string[];
  mask: string;
}
