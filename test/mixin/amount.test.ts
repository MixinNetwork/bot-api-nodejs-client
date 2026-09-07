import BigNumber from 'bignumber.js';
import { afterEach, describe, expect, it } from 'vitest';
import { formatUnits, parseUnits } from '../../src/client/utils/amount';
import { Decoder } from '../../src/client/utils/decoder';
import { Encoder } from '../../src/client/utils/encoder';

describe('amount conversion', () => {
  const originalConfig = BigNumber.config();

  afterEach(() => BigNumber.config(originalConfig));

  it.each([
    { unit: 0, expected: '1' },
    { unit: 8, expected: '0.00000001' },
    { unit: 18, expected: '0.000000000000000001' },
    { unit: 24, expected: '0.000000000000000000000001' },
  ])('preserves one base unit at $unit decimal places', ({ unit, expected }) => {
    const amount = formatUnits('1', unit);

    expect(amount.toFixed()).toBe(expected);
    expect(parseUnits(amount, unit).toFixed()).toBe('1');
  });

  it('preserves transaction amounts with a caller-supplied rounding configuration', () => {
    BigNumber.config({ DECIMAL_PLACES: 2, ROUNDING_MODE: BigNumber.ROUND_UP });
    const output = { type: 0, amount: '1.23456789', keys: [], mask: '00'.repeat(32), script: '' };
    const encoder = new Encoder(Buffer.alloc(0));
    encoder.encodeOutput(output);

    expect(formatUnits('123456789', 8).toFixed()).toBe(output.amount);
    expect(new Decoder(encoder.buffer()).decodeOutput()).toEqual(output);
    expect(BigNumber.config().DECIMAL_PLACES).toBe(2);
  });

  it('keeps exact scaling and the existing floor rounding when parsing', () => {
    expect(parseUnits('90071992.54740993', 8).toFixed()).toBe('9007199254740993');
    expect(parseUnits('1.234567899', 8).toFixed()).toBe('123456789');
    expect(parseUnits('-1.234567899', 8).toFixed()).toBe('-123456790');
  });

  it.each([-1, 1.5, NaN, Infinity])('rejects an invalid unit: %s', unit => {
    expect(() => formatUnits('1', unit)).toThrow('invalid unit');
    expect(() => parseUnits('1', unit)).toThrow('invalid unit');
  });
});
