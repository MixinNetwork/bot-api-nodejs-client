import { describe, expect, it } from 'vitest';
import type { InvoiceEntry, MixinInvoice } from '../../src/client/types';
import { attachInvoiceEntry, attachStorageEntry, getInvoiceString, isStorageEntry, newMixinInvoice, parseMixinInvoice } from '../../src/client/utils/invoice';
import { ExtraSizeGeneralLimit } from '../../src/client/utils/safe';

const recipient = 'MIX3QEeg1WkLrjvjxyMQf6Xc8dxs81tpPc';
const traceID = '772e6bef-3bff-4fcc-987d-29bafca74d63';
const assetID = 'c6d0c728-2624-429b-8e0d-d9d19b6592fa';

const entry = (overrides: Partial<InvoiceEntry> = {}): InvoiceEntry => ({
  trace_id: traceID,
  asset_id: assetID,
  amount: '1',
  extra: Buffer.alloc(0),
  index_references: [],
  hash_references: [],
  ...overrides,
});

describe('Mixin invoices', () => {
  it('rejects references to the current or a future entry', () => {
    const invoice = newMixinInvoice(recipient) as MixinInvoice;

    expect(() => attachInvoiceEntry(invoice, entry({ index_references: [0] }))).toThrow('invalid entry index reference');

    attachInvoiceEntry(invoice, entry());
    expect(() => attachInvoiceEntry(invoice, entry({ index_references: [1] }))).toThrow('invalid entry index reference');
    expect(() => attachInvoiceEntry(invoice, entry({ index_references: [-1] }))).toThrow('invalid entry index reference');
  });

  it('accepts a reference to an earlier entry', () => {
    const invoice = newMixinInvoice(recipient) as MixinInvoice;
    attachInvoiceEntry(invoice, entry());

    expect(() => attachInvoiceEntry(invoice, entry({ index_references: [0] }))).not.toThrow();
  });

  it('rejects a semantically invalid reference while parsing', () => {
    const invoice = newMixinInvoice(recipient) as MixinInvoice;
    invoice.entries.push(entry({ index_references: [0] }));

    expect(parseMixinInvoice(getInvoiceString(invoice))).toBeUndefined();
  });

  it('enforces the regular-entry extra and reference limits', () => {
    const invoice = newMixinInvoice(recipient) as MixinInvoice;

    expect(() => attachInvoiceEntry(invoice, entry({ extra: Buffer.alloc(ExtraSizeGeneralLimit) }))).toThrow('invalid extra length');
    expect(() => attachInvoiceEntry(invoice, entry({ hash_references: Array(17).fill('00'.repeat(32)) }))).toThrow('too many references');
  });

  it('builds and recognizes storage entries', () => {
    const invoice = newMixinInvoice(recipient) as MixinInvoice;

    attachStorageEntry(invoice, traceID, Buffer.alloc(ExtraSizeGeneralLimit + 1));

    expect(invoice.entries).toHaveLength(1);
    expect(isStorageEntry(invoice.entries[0])).toBe(true);
    expect(isStorageEntry({ ...invoice.entries[0], amount: '0' })).toBe(false);
  });

  it.each(['', 'INVinvalid', `${recipient}invalid`])('returns undefined for an invalid invoice: %s', value => {
    expect(parseMixinInvoice(value)).toBeUndefined();
  });
});
