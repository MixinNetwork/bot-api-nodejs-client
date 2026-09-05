import { describe, expect, it } from 'vitest';
import type { Input } from '../../src/client/types';
import { Decoder } from '../../src/client/utils/decoder';
import { Encoder, integerToBytes, putUvarInt } from '../../src/client/utils/encoder';
import { buildMultiSigsTransaction, encodeScript, getTotalBalanceFromOutputs } from '../../src/client/utils/multisigs';

describe('transaction codec', () => {
  it('round-trips a deposit input', () => {
    const input: Input = {
      hash: '11'.repeat(32),
      index: 7,
      deposit: {
        chain: '22'.repeat(32),
        asset: 'asset-key',
        transaction: 'transaction-hash',
        index: 9n,
        amount: 1.25,
      },
    };
    const encoder = new Encoder(Buffer.alloc(0));

    encoder.encodeInput(input);

    expect(new Decoder(encoder.buffer()).decodeInput()).toEqual(input);
  });

  it('round-trips a mint input', () => {
    const input: Input = {
      hash: '33'.repeat(32),
      index: 3,
      mint: {
        group: 'universal',
        batch: 42n,
        amount: 2.5,
      },
    };
    const encoder = new Encoder(Buffer.alloc(0));

    encoder.encodeInput(input);

    expect(new Decoder(encoder.buffer()).decodeInput()).toEqual(input);
  });

  it('encodes safe integers without signed 32-bit truncation', () => {
    expect(Buffer.from(integerToBytes(2 ** 32)).toString('hex')).toBe('0100000000');
    expect(putUvarInt(2 ** 31)).toEqual([0x80, 0x80, 0x80, 0x80, 0x08]);
  });

  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects an invalid integer value: %s', value => {
    expect(() => integerToBytes(value)).toThrow('invalid integer');
    expect(() => putUvarInt(value)).toThrow('invalid integer');
  });

  it('round-trips script and withdrawal outputs', () => {
    const output = {
      type: 0xa1,
      amount: '1.23456789',
      keys: ['44'.repeat(32)],
      mask: '55'.repeat(32),
      script: 'fffe01',
      withdrawal: { address: 'destination', tag: 'memo' },
    };
    const encoder = new Encoder(Buffer.alloc(0));

    encoder.encodeOutput(output);

    expect(new Decoder(encoder.buffer()).decodeOutput()).toEqual(output);
  });

  it('preserves output amounts above Number.MAX_SAFE_INTEGER base units', () => {
    const output = {
      type: 0,
      amount: '90071992.54740993',
      keys: [],
      mask: '00'.repeat(32),
      script: '',
    };
    const encoder = new Encoder(Buffer.alloc(0));

    encoder.encodeOutput(output);

    expect(new Decoder(encoder.buffer()).decodeOutput().amount).toBe(output.amount);
  });

  it('round-trips sorted signature entries', () => {
    const signatures = { 2: '22'.repeat(64), 0: '11'.repeat(64) };
    const encoder = new Encoder(Buffer.alloc(0));

    encoder.encodeSignature(signatures);

    const decoder = new Decoder(encoder.buffer());
    expect(decoder.decodeSignature()).toEqual(signatures);
    expect(decoder.buf).toHaveLength(0);
  });

  it('validates fixed-width encoder inputs', () => {
    const encoder = new Encoder(Buffer.alloc(0));

    expect(() => encoder.writeInt(0x10000)).toThrow('invalid integer');
    expect(() => encoder.writeSlice(Buffer.alloc(129))).toThrow('slice too long');
  });
});

describe('legacy multisig utilities', () => {
  it('encodes valid thresholds and rejects invalid thresholds', () => {
    expect(encodeScript(0)).toBe('fffe00');
    expect(encodeScript(1)).toBe('fffe01');
    expect(encodeScript(255)).toBe('fffeff');
    expect(() => encodeScript(-1)).toThrow('INVALID THRESHOLD');
    expect(() => encodeScript(256)).toThrow('INVALID THRESHOLD');
    expect(() => encodeScript(1.5)).toThrow('INVALID THRESHOLD');
  });

  it('sums output amounts without floating point loss', () => {
    const outputs = [{ amount: '0.1' }, { amount: '0.2' }] as Parameters<typeof getTotalBalanceFromOutputs>[0];

    expect(getTotalBalanceFromOutputs(outputs).toString()).toBe('0.3');
  });

  it('validates transaction versions and omits outputs without a mask', () => {
    const transaction = {
      version: 2,
      asset: '66'.repeat(32),
      inputs: [{ hash: '77'.repeat(32), index: 0 }],
      outputs: [
        { amount: '1', keys: ['88'.repeat(32)], mask: '99'.repeat(32), script: 'fffe01' },
        { amount: '2', keys: [] },
      ],
      extra: '',
    };

    expect(buildMultiSigsTransaction(transaction)).toMatch(/^77770002/);
    expect(() => buildMultiSigsTransaction({ ...transaction, version: 1 })).toThrow('Invalid Version');
  });
});
