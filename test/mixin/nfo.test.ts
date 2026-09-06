import { buildCollectibleMemo, buildTokenId, decodeNfoMemo } from '../../src';

describe('Tests for nfo', () => {
  test('Test for fetch conversation', async () => {
    const memo =
      '4e464f0001000000000000000143d61dcde413450d80b8101d5e903357143c8c161a18ae2c8b14fda1216fff7da88c419b5d103676a640111b42e4923efc4c68d6de400106204d27df6617015c7da6f606106a7f751bc1175b3fcee7ba3eea2e9fec693cff77';
    const nfo = decodeNfoMemo(memo);

    if (nfo.chain && nfo.class && nfo.collection && nfo.token) {
      const tokenId = buildTokenId(nfo.collection, nfo.token);
      expect(tokenId).toEqual('8048de2d-8092-3ccc-a47d-e30da9764f05');

      const res = buildCollectibleMemo(Buffer.from('').toString('hex'), nfo.collection, nfo.token);
      // Compare without content
      expect(res.slice(0, res.length - 2)).toEqual(memo.slice(0, memo.length - 66));
    }
  });

  test('preserves token ID zero in collectible metadata', () => {
    const collection = '3552d116-b29d-4d72-9b24-3ca3b2e0f9c2';

    const nfo = decodeNfoMemo(buildCollectibleMemo('', collection, 0));

    expect(nfo.collection).toBe(collection);
    expect(nfo.token).toBe('0');
  });

  test.each([
    { token: '0', encodedToken: '00', tokenID: 'b0916281-bab5-3489-a0be-5d9cf45595f3' },
    { token: '9007199254740992', encodedToken: '0720000000000000', tokenID: '83066f1c-f439-3c61-8608-1aa08da2bae8' },
    { token: '9007199254740993', encodedToken: '0720000000000001', tokenID: 'c643f3bb-81b6-3792-99c0-f2cfdd35c2f7' },
    {
      token: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      encodedToken: `20${'ff'.repeat(32)}`,
      tokenID: '673cdfda-10b0-38b3-8884-a1a1f1aac1de',
    },
  ])('preserves token $token through memo decoding, encoding, and ID generation', ({ token, encodedToken, tokenID }) => {
    const collection = '3552d116-b29d-4d72-9b24-3ca3b2e0f9c2';
    const prefix = '4e464f0001000000000000000143d61dcde413450d80b8101d5e903357143c8c161a18ae2c8b14fda1216fff7da88c419b5d103552d116b29d4d729b243ca3b2e0f9c2';
    const memo = `${prefix}${encodedToken}00`;

    expect(decodeNfoMemo(memo).token).toBe(token);
    expect(buildCollectibleMemo('', collection, token)).toBe(memo);
    expect(buildCollectibleMemo('', collection, BigInt(token))).toBe(memo);
    expect(buildTokenId(collection, token)).toBe(tokenID);
    expect(buildTokenId(collection, BigInt(token))).toBe(tokenID);
  });

  test.each([6, Number.MAX_SAFE_INTEGER])('continues accepting safe numeric token IDs: %s', token => {
    const collection = '3552d116-b29d-4d72-9b24-3ca3b2e0f9c2';
    const memo = buildCollectibleMemo('', collection, token);

    expect(decodeNfoMemo(memo).token).toBe(String(token));
    expect(buildCollectibleMemo('', collection, String(token))).toBe(memo);
    expect(buildTokenId(collection, token)).toBe(buildTokenId(collection, String(token)));
  });

  test.each([-1, -1n, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '-1', '1.5', 'NaN', 'Infinity', ''])('rejects an invalid or unsafe token: %s', token => {
    const collection = '3552d116-b29d-4d72-9b24-3ca3b2e0f9c2';

    expect(() => buildCollectibleMemo('', collection, token)).toThrow('invalid token');
    expect(() => buildTokenId(collection, token)).toThrow('invalid token');
  });
});
