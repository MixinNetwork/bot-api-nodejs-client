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
    expect(nfo.token).toBe(0);
  });
});
