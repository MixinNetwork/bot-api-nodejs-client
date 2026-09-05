import { describe, expect, it } from 'vitest';
import type { SafeTransactionRecipient, SafeUtxoOutput } from '../../src/client/types';
import { getMainnetAddressFromSeed } from '../../src/client/utils/address';
import {
  buildSafeTransaction,
  buildSafeTransactionRecipient,
  estimateStorageCost,
  ExtraSizeGeneralLimit,
  ExtraSizeStorageCapacity,
  getRecipientForStorage,
  getUnspentOutputsForRecipients,
  OutputTypeScript,
  OutputTypeWithdrawalSubmit,
} from '../../src/client/utils/safe';

const userID = '67a87828-18f5-46a1-b6cc-c72a97a77c43';

const output = (state: SafeUtxoOutput['state'], amount: string, output_index: number) =>
  ({
    state,
    amount,
    output_index,
    transaction_hash: `${output_index}`.padStart(64, '0'),
  }) as SafeUtxoOutput;

describe('safe transaction utilities', () => {
  it('selects only unspent outputs and returns exact change', () => {
    const spent = output('spent', '100', 0);
    const first = output('unspent', '0.4', 1);
    const signed = output('signed', '100', 2);
    const second = output('unspent', '0.7', 3);
    const recipients: SafeTransactionRecipient[] = [buildSafeTransactionRecipient([userID], 1, '1')];

    const result = getUnspentOutputsForRecipients([spent, first, signed, second], recipients);

    expect(result.utxos).toEqual([first, second]);
    expect(result.change.toString()).toBe('0.1');
  });

  it('throws when unspent outputs cannot cover the recipients', () => {
    const recipients: SafeTransactionRecipient[] = [buildSafeTransactionRecipient([userID], 1, '1')];

    expect(() => getUnspentOutputsForRecipients([output('spent', '10', 0), output('unspent', '0.9', 1)], recipients)).toThrow('insufficient total input outputs');
  });

  it('rejects mixed or empty recipient member formats', () => {
    expect(() => buildSafeTransactionRecipient([], 1, '1')).toThrow('empty members');
    expect(() => buildSafeTransactionRecipient([userID, 'XIN-not-an-address'], 1, '1')).toThrow('empty members');
    expect(() => buildSafeTransactionRecipient(['XIN-not-an-address'], 1, '1')).toThrow('empty members');
    expect(() => buildSafeTransactionRecipient([userID], 0, '1')).toThrow('invalid threshold');
  });

  it('builds script and withdrawal outputs', () => {
    const utxo = { ...output('unspent', '1.5', 1), asset: 'aa'.repeat(32) };
    const normal = buildSafeTransactionRecipient([userID], 1, '1');
    const withdrawal: SafeTransactionRecipient = { destination: 'external-address', tag: 'memo', amount: '0.5' };

    const transaction = buildSafeTransaction([utxo], [normal, withdrawal], [{ mask: 'bb'.repeat(32), keys: ['cc'.repeat(32)] }, undefined], Buffer.from('memo'), ['dd'.repeat(32)]);

    expect(transaction.inputs).toEqual([{ hash: utxo.transaction_hash, index: 1 }]);
    expect(transaction.outputs).toEqual([
      {
        type: OutputTypeScript,
        amount: '1',
        keys: ['cc'.repeat(32)],
        mask: 'bb'.repeat(32),
        script: 'fffe01',
      },
      {
        type: OutputTypeWithdrawalSubmit,
        amount: '0.5',
        withdrawal: { address: 'external-address', tag: 'memo' },
        keys: [],
      },
    ]);
    expect(transaction.references).toEqual(['dd'.repeat(32)]);
  });

  it('builds zero-threshold outputs for mainnet recipients', () => {
    const utxo = { ...output('unspent', '1', 1), asset: 'aa'.repeat(32) };
    const address = getMainnetAddressFromSeed(Buffer.alloc(64, 1));
    const recipient = buildSafeTransactionRecipient([address], 0, '1');
    const ghost = { mask: 'bb'.repeat(32), keys: ['cc'.repeat(32)] };

    const transaction = buildSafeTransaction([utxo], [recipient], [ghost], Buffer.alloc(0));

    expect(transaction.outputs).toEqual([
      {
        type: OutputTypeScript,
        amount: '1',
        keys: ghost.keys,
        mask: ghost.mask,
        script: 'fffe00',
      },
    ]);
  });

  it('validates transaction inputs, recipients, assets, ghosts, and extra size', () => {
    const first = { ...output('unspent', '1', 1), asset: 'aa'.repeat(32) };
    const second = { ...output('unspent', '1', 2), asset: 'bb'.repeat(32) };
    const recipient = buildSafeTransactionRecipient([userID], 1, '1');

    expect(() => buildSafeTransaction([], [recipient], [], Buffer.alloc(0))).toThrow('empty inputs');
    expect(() => buildSafeTransaction([first], [], [], Buffer.alloc(0))).toThrow('empty recipients');
    expect(() => buildSafeTransaction([first, second], [recipient], [{ mask: '', keys: [] }], Buffer.alloc(0))).toThrow('inconsistent asset');
    expect(() => buildSafeTransaction([first], [recipient], [], Buffer.alloc(0))).toThrow('invalid ghost key');
    expect(() => buildSafeTransaction([first], [{ destination: 'address', amount: '1' }], [], Buffer.alloc(ExtraSizeGeneralLimit + 1))).toThrow('extra data is too long');
    expect(() => buildSafeTransaction([first], [getRecipientForStorage(Buffer.alloc(1))], [], Buffer.alloc(ExtraSizeStorageCapacity + 1))).toThrow('extra data is too long');
  });

  it('calculates storage cost in 1 KiB steps', () => {
    expect(estimateStorageCost(Buffer.alloc(0)).toString()).toBe('0.0001');
    expect(estimateStorageCost(Buffer.alloc(1023)).toString()).toBe('0.0001');
    expect(estimateStorageCost(Buffer.alloc(1024)).toString()).toBe('0.0002');
  });
});
