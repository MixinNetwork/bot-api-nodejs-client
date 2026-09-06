import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import type { Input } from '../../src/client/types';
import { bytesToInterger, Decoder } from '../../src/client/utils/decoder';
import { bigNumberToBytes, Encoder, integerToBytes, putUvarInt } from '../../src/client/utils/encoder';
import { buildMultiSigsTransaction, encodeScript, getTotalBalanceFromOutputs } from '../../src/client/utils/multisigs';

describe('transaction codec', () => {
  it('accepts a numeric deposit amount and decodes it as a string', () => {
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

    expect(new Decoder(encoder.buffer()).decodeInput()).toEqual({
      ...input,
      deposit: { ...input.deposit, amount: '1.25' },
    });
  });

  it('accepts a numeric mint amount and decodes it as a string', () => {
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

    expect(new Decoder(encoder.buffer()).decodeInput()).toEqual({
      ...input,
      mint: { ...input.mint, amount: '2.5' },
    });
  });

  describe.each([
    {
      kind: 'deposit' as const,
      prefix: '11'.repeat(32) + '000700007777' + '22'.repeat(32) + '000961737365742d6b657900107472616e73616374696f6e2d686173680000000000000009',
      suffix: '0000',
    },
    {
      kind: 'mint' as const,
      prefix: '33'.repeat(32) + '00030000000077770009756e6976657273616c000000000000002a',
      suffix: '',
    },
  ])('$kind amount precision', ({ kind, prefix, suffix }) => {
    it.each([
      { amount: '70000000.00000002', baseUnitsHex: '18de76816d8002' },
      { amount: '90071992.54740993', baseUnitsHex: '20000000000001' },
    ])('preserves $amount when decoding and re-encoding', ({ amount, baseUnitsHex }) => {
      // Fixed wire amounts cover base-unit integers below and above Number.MAX_SAFE_INTEGER.
      const raw = Buffer.from(`${prefix}0007${baseUnitsHex}${suffix}`, 'hex');
      const decoder = new Decoder(raw);

      const input = decoder.decodeInput();

      expect(input[kind]?.amount).toBe(amount);
      expect(decoder.buf).toHaveLength(0);

      const encoder = new Encoder(Buffer.alloc(0));
      encoder.encodeInput(input);

      expect(encoder.buffer()).toEqual(raw);
    });
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

  it.each(['writeInt', 'writeUint16', 'writeUint32'] as const)('%s rejects invalid integers instead of truncating them', method => {
    const encoder = new Encoder(Buffer.alloc(0));

    for (const value of [NaN, Infinity, -1, 1.5]) {
      expect(() => encoder[method](value)).toThrow('invalid integer');
    }
    expect(encoder.buffer()).toHaveLength(0);
  });

  it('preserves fixed-width integer boundaries', () => {
    const encoder = new Encoder(Buffer.alloc(0));
    encoder.writeInt(0);
    encoder.writeUint16(0xffff);
    encoder.writeUint32(0xffffffff);

    expect(encoder.hex()).toBe('0000ffffffffffff');
    expect(() => encoder.writeUint16(0x10000)).toThrow('invalid integer');
    expect(() => encoder.writeUint32(0x100000000)).toThrow('invalid integer');
  });

  it.each([-1, 1.5, NaN])('rejects an invalid aggregated signer index: %s', index => {
    const encoder = new Encoder(Buffer.alloc(0));

    expect(() => encoder.encodeAggregatedSignature({ signature: '11'.repeat(64), signers: [index] })).toThrow('invalid signer');
  });

  it.each(['-1', '-0.00000001'])('rejects a negative output amount: %s', amount => {
    const encoder = new Encoder(Buffer.alloc(0));

    expect(() => encoder.encodeOutput({ amount, keys: [] })).toThrow('invalid integer');
  });

  it('rejects fractional big integers without changing valid encodings', () => {
    expect(() => bigNumberToBytes(BigNumber('1.5'))).toThrow('invalid integer');
    expect(bigNumberToBytes(BigNumber(0)).toString('hex')).toBe('00');
    expect(bigNumberToBytes(BigNumber('9007199254740993')).toString('hex')).toBe('20000000000001');
  });

  it.each(['NaN', 'Infinity', '-Infinity'])('rejects %s before entering the byte conversion loop', amount => {
    // Make a regression fail immediately instead of hanging the test process.
    const mod = vi.spyOn(BigNumber.prototype, 'mod').mockImplementation(() => {
      throw new Error('non-finite value reached byte conversion');
    });
    try {
      expect(() => bigNumberToBytes(BigNumber(amount))).toThrow('invalid integer');
      expect(() => new Encoder(Buffer.alloc(0)).encodeOutput({ amount, keys: [] })).toThrow('invalid integer');
      expect(mod).not.toHaveBeenCalled();
    } finally {
      mod.mockRestore();
    }
  });

  it('keeps legacy integer decoding exact within the safe range', () => {
    expect(bytesToInterger(Buffer.alloc(0))).toBe(0);
    expect(bytesToInterger(Buffer.from('001fffffffffffff', 'hex'))).toBe(Number.MAX_SAFE_INTEGER);
    expect(new Decoder(Buffer.from('00071fffffffffffff', 'hex')).readInteger()).toBe(Number.MAX_SAFE_INTEGER);
  });

  it.each(['20000000000000', '20000000000001', 'ffffffffffffff'])('rejects legacy integer overflow for %s and offers an exact decoder', hex => {
    const raw = Buffer.from(`0007${hex}`, 'hex');

    expect(() => bytesToInterger(Buffer.from(hex, 'hex'))).toThrow('Number.MAX_SAFE_INTEGER');
    expect(() => new Decoder(raw).readInteger()).toThrow('Number.MAX_SAFE_INTEGER');
    expect(new Decoder(raw).readBigInteger().toFixed()).toBe(BigInt(`0x${hex}`).toString());
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
