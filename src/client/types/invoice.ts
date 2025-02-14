import type { MixAddress } from './address';

export interface InvoiceEntry {
  trace_id: string;
  asset_id: string;
  amount: string;
  extra: Buffer;
  index_references: number[];
  hash_references: string[];
}

export interface MixinInvoice {
  version: number;
  recipient: MixAddress;
  entries: InvoiceEntry[];
}
