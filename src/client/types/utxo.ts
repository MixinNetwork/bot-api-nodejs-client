export type UtxoState = 'unspent' | 'signed' | 'spent';

export interface UtxoOutput {
  utxo_id: string;
  type: string;
  user_id: string;
  asset_id: string;
  transaction_hash: string;
  output_index: number;
  amount: string;
  members: string[];
  threshold: number;
  memo?: string;
  state: UtxoState;
  created_at: string;
  updated_at: string;
}

export interface OutputRequest {
  members: string[];
  threshold: number;
  state?: UtxoState;
  offset?: string;
  limit?: number;
}
