export type UTXOState = 'unspent' | 'signed' | 'spent';

export type MultisigInitAction = 'sign' | 'unlock';

export type MultisigAction = 'sign' | 'unlock' | 'cancel';

export type MultisigState = 'initial' | 'signed';

export type MultisigOrder = 'created' | 'updated';

export interface MultisigResponse {
  type: string;
  user_id: string;
  utxo_id: string;
  asset_id: string;
  transaction_hash: string;
  output_index: number;
  amount: string;
  threshold: number;
  members: string[];
  memo: string;
  state: UTXOState;
  created_at: string;
  updated_at: string;
  signed_by: string;
  signed_tx: string;
}

export interface MultisigRequest {
  type: string;
  request_id: string;
  user_id: string;
  asset_id: string;
  amount: string;
  threshold: string;
  senders: string;
  receivers: string;
  signers: string;
  memo: string;
  action: MultisigInitAction;
  state: MultisigState;
  transaction_hash: string;
  raw_transaction: string;
  created_at: string;
  updated_at: string;
  code_id: string;
}

export interface MultisigIndexRequest {
  members: string[];
  threshold: number;
  state?: UTXOState;
  offset?: string;
  limit?: number;
  order: MultisigOrder;
};