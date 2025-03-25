import BigNumber from 'bignumber.js';
import type { InvoiceEntry, MixinInvoice } from '../types';
import Encoder from './encoder';
import { getMixAddressBuffer, getMixAddressStringFromBuffer, parseMixAddress } from './address';
import { newHash } from './uniq';
import { base64RawURLDecode, base64RawURLEncode } from './base64';
import { Decoder } from './decoder';
import { ExtraSizeGeneralLimit, ExtraSizeStorageCapacity, estimateStorageCost, ReferencesCountLimit } from './safe';
import { XINAssetID } from '../../constant';

export const MixinInvoicePrefix = 'MIN';
export const MixinInvoiceVersion = 0;

export const parseMixinInvoice = (s: string) => {
  try {
    if (!s.startsWith(MixinInvoicePrefix)) return undefined;

    const data = base64RawURLDecode(s.slice(3));
    if (data.length < 3 + 23 + 1) return undefined;

    const payload = data.subarray(0, data.length - 4);
    const msg = Buffer.concat([Buffer.from(MixinInvoicePrefix), Buffer.from(payload)]);
    const checksum = newHash(msg);
    if (!checksum.subarray(0, 4).equals(Buffer.from(data.subarray(data.length - 4)))) return undefined;

    const dec = new Decoder(data);
    const version = dec.readByte();
    if (version !== MixinInvoiceVersion) return undefined;
    const rl = dec.readInt();
    const rb = dec.readSubarray(rl);
    const recipient = getMixAddressStringFromBuffer(rb);
    const mi = newMixinInvoice(recipient);
    if (!mi) return undefined;

    const el = dec.readByte();
    for (let i = 0; i < el; i++) {
      const trace_id = dec.readUUID();
      const asset_id = dec.readUUID();
      const amount = dec.readBytesBuffer().toString();
      const el = dec.readInt();
      const extra = dec.readSubarray(el);
      const entry: InvoiceEntry = {
        trace_id,
        asset_id,
        amount,
        extra,
        index_references: [],
        hash_references: [],
      };
      const rl = dec.readByte();
      for (let j = 0; j < rl; j++) {
        const flag = dec.readByte();
        if (flag === 1) {
          const ref = dec.readByte();
          entry.index_references.push(ref);
        } else if (flag === 0) {
          const hash = dec.readSubarray(32).toString('hex');
          entry.hash_references.push(hash);
        } else return undefined;
      }
      mi.entries.push(entry);
    }

    return mi;
  } catch {
    return undefined;
  }
};

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
  if (entry.extra.byteLength >= ExtraSizeGeneralLimit) {
    throw new Error('invalid extra length');
  }
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

export const attachStorageEntry = (invoice: MixinInvoice, trace_id: string, extra: Buffer) => {
  const amount = estimateStorageCost(extra).toString();
  const entry: InvoiceEntry = {
    trace_id,
    asset_id: XINAssetID,
    amount,
    extra,
    index_references: [],
    hash_references: [],
  };
  invoice.entries.push(entry);
};

export const isStorageEntry = (entry: InvoiceEntry) => {
  const expect = estimateStorageCost(entry.extra);
  const actual = BigNumber(entry.amount);
  return entry.asset_id === XINAssetID && entry.extra.byteLength > ExtraSizeGeneralLimit && expect.comparedTo(actual) === 0;
};

export const getInvoiceBuffer = (invoice: MixinInvoice) => {
  const enc = new Encoder(Buffer.from([invoice.version]));

  const r = getMixAddressBuffer(invoice.recipient);
  if (r.byteLength > 1024) {
    throw new Error(`invalid recipient length: ${r.byteLength}`);
  }
  enc.writeUint16(r.byteLength);
  enc.write(r);

  if (invoice.entries.length > 128) {
    throw new Error(`invalid count of entries: ${r.byteLength}`);
  }
  enc.write(Buffer.from([invoice.entries.length]));

  invoice.entries.forEach(entry => {
    enc.writeUUID(entry.trace_id);
    enc.writeUUID(entry.asset_id);
    const amount = BigNumber(entry.amount).toFixed(8, BigNumber.ROUND_FLOOR);
    if (amount.length > 128) {
      throw new Error(`invalid amount of entry: ${amount}`);
    }
    enc.write(Buffer.from([amount.length]));
    enc.write(Buffer.from(amount));
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
