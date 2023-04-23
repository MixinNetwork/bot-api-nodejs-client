import { Input, Output } from '../../mvm';

export type UTXOState = 'unspent' | 'signed' | 'spent';

export type MultisigInitAction = 'sign' | 'unlock';

export type MultisigAction = MultisigInitAction | 'cancel';

export type MultisigState = 'initial' | 'signed' | 'unlocked';

export type MultisigOrder = 'created' | 'updated';

export interface MultisigRequest {
  members: string[];
  threshold: number;
  state?: UTXOState;
  offset?: string;
  limit?: number;
  order: MultisigOrder;
}

export interface MultisigUTXOResponse {
  type: 'multisig_utxo';
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
  sender: string;
  created_at: string;
  updated_at: string;
  signed_by: string;
  signed_tx: string;
}

export interface MultisigRequestResponse {
  type: string;
  request_id: string;
  user_id: string;
  asset_id: string;
  amount: string;
  threshold: string;
  senders: string;
  receivers: string[];
  signers: string[];
  memo: string[];
  action: MultisigInitAction;
  state: MultisigState;
  transaction_hash: string;
  raw_transaction: string;
  created_at: string;
  updated_at: string;
  code_id: string;
}

export interface MultisigTransaction {
  /** 2 */
  version: number;
  /** mixin_id of asset */
  asset: string;
  inputs: Input[];
  outputs: Output[];
  extra: string;
}
