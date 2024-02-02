import { Input, Output } from './mixin_transaction';
import { UtxoState } from './utxo';

export type MultisigInitAction = 'sign' | 'unlock';

export type MultisigAction = MultisigInitAction | 'cancel';

export type MultisigState = 'initial' | 'signed' | 'unlocked';

export type MultisigOrder = 'created' | 'updated';

export interface MultisigRequest {
  members: string[];
  threshold: number;
  state?: UtxoState;
  offset?: string;
  limit?: number;
  order?: MultisigOrder;
}

export interface MultisigUtxoResponse {
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
  state: UtxoState;
  sender: string;
  created_at: string;
  updated_at: string;
  signed_by: string;
  signed_tx: string;
}

export interface MultisigRequestResponse {
  type: 'multisig_request';
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

export interface SafeTransaction extends MultisigTransaction {
  references: string[];
  signatureMap: Record<number, string>[];
}

export interface SafeMultisigsResponse {
  type: 'transaction_request';
  request_id: string;
  transaction_hash: string;
  asset_id: string; // asset uuid
  kernel_asset_id: string; // SHA256Hash of asset uuid
  amount: string;
  receivers: string[];
  senders: string[];
  senders_hash: string;
  senders_threshold: number;
  signers: string[];
  extra: string;
  raw_transaction: string;
  created_at: string;
  updated_at: string;
  views: string[];
}
