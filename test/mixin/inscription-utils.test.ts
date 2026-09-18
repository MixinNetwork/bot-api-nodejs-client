import { describe, expect, it, vi } from 'vitest';
import type { SafeUtxoOutput, SequencerTransactionRequest } from '../../src/client/types';
import type { InscriptionUtxoClient } from '../../src/client/utils/inscription';
import {
  buildInscriptionOperationExtra,
  decodeInscriptionOperationExtra,
  getInscriptionOutput,
  InscriptionModeDone,
  InscriptionModeInstant,
  transferInscription,
} from '../../src/client/utils/inscription';
import { buildSafeTransactionRecipient, decodeSafeTransaction, getUnspentOutputsForRecipients } from '../../src/client/utils/safe';
import { SafeKeystoreClient } from '../../src/client/safe';

const userID = '67a87828-18f5-46a1-b6cc-c72a97a77c43';
const spendPrivateKey = '11'.repeat(32);
const viewKey = '01'.repeat(32);

const inscriptionOutput = (sequence: number, inscriptionHash?: string): SafeUtxoOutput =>
  ({
    state: 'unspent',
    amount: '1000',
    output_index: 0,
    sequence,
    asset: 'aa'.repeat(32),
    transaction_hash: `${sequence}`.padStart(64, '0'),
    inscription_hash: inscriptionHash,
  }) as SafeUtxoOutput;

describe('inscription operation extras', () => {
  it('encodes operation payloads as JSON extra', () => {
    const extra = buildInscriptionOperationExtra({
      operation: 'inscribe',
      recipient: 'MIX...',
      content: 'text/plain;charset=UTF-8,cedric.mao',
    });
    expect(JSON.parse(extra.toString())).toEqual({
      operation: 'inscribe',
      recipient: 'MIX...',
      content: 'text/plain;charset=UTF-8,cedric.mao',
    });
  });

  it('keeps the deploy modes aligned with the Go SDK', () => {
    expect(InscriptionModeInstant).toBe(1);
    expect(InscriptionModeDone).toBe(2);
  });

  it('decodes operation extras from buffer or hex string', () => {
    const inscribe = {
      operation: 'inscribe',
      recipient: 'MIX...',
      content: 'text/plain;charset=UTF-8,cedric.mao',
    } as const;
    expect(decodeInscriptionOperationExtra(buildInscriptionOperationExtra(inscribe))).toEqual(inscribe);

    const deploy = {
      version: 1,
      mode: InscriptionModeInstant,
      supply: '1000000000',
      unit: '1000000',
      symbol: 'MAO',
      name: 'Mixin Advanced Ordinals',
      icon: 'image/webp;base64,IVVB===',
    } as const;
    expect(decodeInscriptionOperationExtra(buildInscriptionOperationExtra(deploy).toString('hex'))).toEqual(deploy);

    const distribute = { distribute: 'distribute', sequence: 0 } as const;
    expect(decodeInscriptionOperationExtra(buildInscriptionOperationExtra(distribute))).toEqual(distribute);
    expect(buildInscriptionOperationExtra(distribute).toString()).toBe(JSON.stringify({ distribute: 'distribute', sequence: 0 }));

    const occupy = { operation: 'occupy', sequence: 3 } as const;
    expect(decodeInscriptionOperationExtra(buildInscriptionOperationExtra(occupy))).toEqual(occupy);
  });

  it('rejects invalid or unknown operation extras', () => {
    expect(() => decodeInscriptionOperationExtra('00ff')).toThrow('invalid inscription operation extra');
    expect(() => decodeInscriptionOperationExtra(Buffer.from('"text"'))).toThrow('invalid inscription operation extra');
    expect(() => decodeInscriptionOperationExtra(Buffer.from('{}'))).toThrow('unknown inscription operation');
    expect(() => decodeInscriptionOperationExtra(Buffer.from(JSON.stringify({ operation: 'inscribe' })))).toThrow('unknown inscription operation');
    expect(() => decodeInscriptionOperationExtra(Buffer.from(JSON.stringify({ operation: 'distribute', sequence: 0 })))).toThrow('unknown inscription operation');
    expect(() => decodeInscriptionOperationExtra(Buffer.from(JSON.stringify({ operation: 'distribute', sequence: 'x' })))).toThrow('unknown inscription operation');
    expect(() => decodeInscriptionOperationExtra(Buffer.from(JSON.stringify({ distribute: 'distribute', sequence: 'x' })))).toThrow('unknown inscription operation');
    expect(() => decodeInscriptionOperationExtra(Buffer.from(JSON.stringify({ version: 2, mode: 1 })))).toThrow('unknown inscription operation');
  });
});

describe('inscription aware output selection', () => {
  it('skips inscription outputs by default', () => {
    const inscription = inscriptionOutput(0, 'bb'.repeat(32));
    const normal = inscriptionOutput(1);
    const recipients = [buildSafeTransactionRecipient([userID], 1, '1000')];

    const result = getUnspentOutputsForRecipients([inscription, normal], recipients);

    expect(result.utxos).toEqual([normal]);
    expect(result.change.toString()).toBe('0');
  });

  it('throws when only inscription outputs can cover the recipients', () => {
    const inscription = inscriptionOutput(0, 'bb'.repeat(32));
    const recipients = [buildSafeTransactionRecipient([userID], 1, '1000')];

    expect(() => getUnspentOutputsForRecipients([inscription], recipients)).toThrow('insufficient total input outputs');
  });

  it('includes inscription outputs when explicitly requested', () => {
    const inscription = inscriptionOutput(0, 'bb'.repeat(32));
    const recipients = [buildSafeTransactionRecipient([userID], 1, '1000')];

    const result = getUnspentOutputsForRecipients([inscription], recipients, { includeInscriptions: true });

    expect(result.utxos).toEqual([inscription]);
  });
});

describe('getInscriptionOutput', () => {
  it('paginates outputs until the inscription is found', async () => {
    const target = inscriptionOutput(0, 'dd'.repeat(32));
    const pages = [[inscriptionOutput(3), inscriptionOutput(2), inscriptionOutput(1)], [target]];
    const safeOutputs = vi.fn(async () => pages.shift() ?? []);

    const found = await getInscriptionOutput({ safeOutputs } as InscriptionUtxoClient, 'dd'.repeat(32), { limit: 3 });

    expect(found).toEqual(target);
    expect(safeOutputs).toHaveBeenCalledTimes(2);
    expect(safeOutputs).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 1, state: 'unspent' }));
  });

  it('throws when the inscription is nowhere unspent', async () => {
    const safeOutputs = vi.fn(async () => [inscriptionOutput(0)]);

    await expect(getInscriptionOutput({ safeOutputs } as InscriptionUtxoClient, 'dd'.repeat(32))).rejects.toThrow('unspent inscription output not found');
  });
});

describe('transferInscription', () => {
  const ghost = { mask: 'ee'.repeat(32), keys: ['ff'.repeat(32)] };

  const transferClient = (utxo: SafeUtxoOutput) => {
    const sendTransactions = vi.fn(async (params: { raw: string; request_id: string }[]) => params.map(p => ({ request_id: p.request_id }) as SequencerTransactionRequest));
    return {
      client: {
        safeOutputs: vi.fn(async () => [utxo]),
        ghostKey: vi.fn(async () => [ghost]),
        verifyTransaction: vi.fn(async () => [{ views: [viewKey] }]) as unknown as Promise<SequencerTransactionRequest[]>,
        sendTransactions,
      } as InscriptionUtxoClient,
      sendTransactions,
    };
  };

  it('spends the whole inscription output to the recipient', async () => {
    const utxo = inscriptionOutput(7, 'dd'.repeat(32));
    const { client, sendTransactions } = transferClient(utxo);

    const results = await transferInscription(client, {
      inscriptionHash: 'dd'.repeat(32),
      receivers: [userID],
      threshold: 1,
      spendPrivateKey,
      memo: 'enjoy',
      request_id: '00000000-0000-4000-8000-000000000001',
    });

    expect(results[0].request_id).toBe('00000000-0000-4000-8000-000000000001');
    expect(client.safeOutputs).toHaveBeenCalledWith({ members: undefined, threshold: undefined, state: 'unspent', offset: undefined, limit: 500 });

    const raw = sendTransactions.mock.calls[0][0][0].raw as string;
    const tx = decodeSafeTransaction(raw);
    expect(tx.inputs).toEqual([{ hash: utxo.transaction_hash, index: utxo.output_index }]);
    expect(tx.outputs).toHaveLength(1);
    expect(tx.outputs[0].amount).toBe('1000');
    expect(tx.outputs[0].keys).toEqual(ghost.keys);
    expect(Buffer.from(tx.extra).toString()).toBe('enjoy');
    expect(tx.signatureMap?.[0]?.[0]).toHaveLength(128);
  });

  it('rejects outputs without inscription or with mismatched hash', async () => {
    const plain = inscriptionOutput(0);
    await expect(transferInscription(transferClient(plain).client, { utxo: plain, receivers: [userID], threshold: 1, spendPrivateKey })).rejects.toThrow(
      'does not carry an inscription',
    );

    const inscribed = inscriptionOutput(0, 'dd'.repeat(32));
    await expect(
      transferInscription(transferClient(inscribed).client, {
        utxo: inscribed,
        inscriptionHash: 'ee'.repeat(32),
        receivers: [userID],
        threshold: 1,
        spendPrivateKey,
      }),
    ).rejects.toThrow('inscription hash mismatch');
  });

  it('requires either utxo or inscriptionHash', async () => {
    await expect(transferInscription({} as InscriptionUtxoClient, { receivers: [userID], threshold: 1, spendPrivateKey })).rejects.toThrow(
      'either utxo or inscriptionHash is required',
    );
  });
});

describe('client.safe.transferInscription', () => {
  it('rejects when no spend private key is available', async () => {
    const axiosInstance = { get: vi.fn(), post: vi.fn() } as never;
    const client = SafeKeystoreClient(axiosInstance, { app_id: 'app', session_id: 'session', server_public_key: 'server', session_private_key: 'private' });

    await expect(client.transferInscription({ inscriptionHash: 'dd'.repeat(32), receivers: [userID], threshold: 1 })).rejects.toThrow('spend private key is required');
  });
});
