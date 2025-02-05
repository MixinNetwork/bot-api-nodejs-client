import type { InvoiceEntry, MixinInvoice } from '../types';
import Encoder from './encoder';
import { getMixAddressBuffer, parseMixAddress } from './address';
import { newHash } from './uniq';
import { base64RawURLEncode } from './base64';
import { ExtraSizeStorageCapacity, ReferencesCountLimit } from '../../constant';

export const MixinInvoicePrefix = 'MIN';
export const MixinInvoiceVersion = 0;

export const newMixinInvoice = (recipient: string) => {
  const r = parseMixAddress(recipient);
  if (!r) return r;
  return {
    version: MixinInvoiceVersion,
    recipient: r,
    entries: [],
  } as MixinInvoice;
};

export const attachInvoiceEntry = (invoice: MixinInvoice, entry: InvoiceEntry) => {
  if (entry.hash_references.length + entry.index_references.length > ReferencesCountLimit) {
    throw new Error('too many references');
  }
  entry.index_references.forEach(ref => {
    if (ref > invoice.entries.length) {
      throw new Error(`invalid entry index reference: ${ref}`);
    }
  });
  invoice.entries.push(entry);
};

export const getInvoiceBuffer = (invoice: MixinInvoice) => {
  const enc = new Encoder(Buffer.from([invoice.version]));

  const r = getMixAddressBuffer(invoice.recipient);
  if (r.byteLength > 1024) {
    throw new Error(`invalid recipient length: ${r.byteLength}`);
  }
  enc.writeBytes(r);

  if (invoice.entries.length > 128) {
    throw new Error(`invalid count of entries: ${r.byteLength}`);
  }
  enc.write(Buffer.from([invoice.entries.length]));

  invoice.entries.forEach(entry => {
    enc.writeUUID(entry.trace_id);
    enc.writeUUID(entry.asset_id);
    if (entry.amount.length > 128) {
      throw new Error(`invalid amount of entry: ${entry.amount}`);
    }
    enc.write(Buffer.from([entry.amount.length]));
    enc.write(Buffer.from(entry.amount));
    if (entry.extra.length > ExtraSizeStorageCapacity) {
      throw new Error(`invalid extra of entry: ${entry.extra}`);
    }
    enc.writeUint16(entry.extra.length);
    enc.write(entry.extra);

    const rl = entry.index_references.length + entry.hash_references.length;
    if (rl > ReferencesCountLimit) {
      throw new Error(`invalid count of references: ${entry.index_references.length} ${entry.hash_references.length}`);
    }
    enc.write(Buffer.from([rl]));
    entry.index_references.forEach(ref => {
      enc.write(Buffer.from([1, ref]));
    });
    entry.hash_references.forEach(ref => {
      enc.write(Buffer.concat([Buffer.from([0]), Buffer.from(ref, 'hex')]));
    });
  });
  return enc.buffer();
};

export const getInvoiceString = (invoice: MixinInvoice) => {
  const payload = getInvoiceBuffer(invoice);

  const msg = Buffer.concat([Buffer.from(MixinInvoicePrefix), payload]);
  const checksum = newHash(msg);
  const data = Buffer.concat([payload, checksum.subarray(0, 4)]);
  return `${MixinInvoicePrefix}${base64RawURLEncode(data)}`;
};
