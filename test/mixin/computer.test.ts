import { parse as parseUUID } from 'uuid';
import { describe, expect, it } from 'vitest';
import {
  buildComputerExtra,
  buildSystemCallExtra,
  checkSystemCallSize,
  encodeMtgExtra,
  MAX_SOLANA_TX_SIZE,
  OperationTypeSystemCall,
  userIdToBytes,
} from '../../src/client/utils/computer';
import { base64RawURLDecode } from '../../src/client/utils/base64';

const appID = '4b79fe76-0d9d-49e6-85fd-0f6be01147da';
const callID = 'a03a4496-3e59-4abd-bd1e-1ab8a2acb550';
const feeID = '772e6bef-3bff-4fcc-987d-29bafca74d63';

describe('computer utilities', () => {
  it('encodes unsigned 64-bit user IDs', () => {
    expect(userIdToBytes('0')).toEqual(Buffer.alloc(8));
    expect(userIdToBytes('1').toString('hex')).toBe('0000000000000001');
    expect(userIdToBytes('18446744073709551615').toString('hex')).toBe('ffffffffffffffff');
  });

  it.each(['invalid', '-1', '1.5', '18446744073709551616'])('rejects an invalid user ID: %s', userID => {
    expect(() => userIdToBytes(userID)).toThrow('invalid user id');
  });

  it('checks the Solana transaction size boundary', () => {
    expect(checkSystemCallSize(Buffer.alloc(MAX_SOLANA_TX_SIZE))).toBe(true);
    expect(checkSystemCallSize(Buffer.alloc(MAX_SOLANA_TX_SIZE + 1))).toBe(false);
  });

  it('builds system call extras with and without a fee ID', () => {
    const base = Buffer.concat([userIdToBytes('1'), Buffer.from(parseUUID(callID)), Buffer.from([1])]);

    expect(buildSystemCallExtra('1', callID, true)).toEqual(base);
    expect(buildSystemCallExtra('1', callID, false, feeID)).toEqual(
      Buffer.concat([userIdToBytes('1'), Buffer.from(parseUUID(callID)), Buffer.from([0]), Buffer.from(parseUUID(feeID))]),
    );
  });

  it('prefixes operation and MTG extras', () => {
    const operation = buildComputerExtra(OperationTypeSystemCall, Buffer.from('payload'));

    expect(operation).toEqual(Buffer.concat([Buffer.from([OperationTypeSystemCall]), Buffer.from('payload')]));
    expect(base64RawURLDecode(encodeMtgExtra(appID, operation))).toEqual(Buffer.concat([Buffer.from(parseUUID(appID)), operation]));
  });
});
