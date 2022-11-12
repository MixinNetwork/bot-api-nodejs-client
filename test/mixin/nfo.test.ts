import { buildCollectibleMemo, buildTokenId, decodeNfoMemo, base64RawURLDecode } from '../../src';

describe('Tests for nfo', () => {
  test('Test for fetch conversation', async () => {
    const memo =
      '4e464f0001000000000000000143d61dcde413450d80b8101d5e903357143c8c161a18ae2c8b14fda1216fff7da88c419b5d103676a640111b42e4923efc4c68d6de400106204d27df6617015c7da6f606106a7f751bc1175b3fcee7ba3eea2e9fec693cff77';
    const nfo = decodeNfoMemo(memo);

    if (nfo.chain && nfo.class && nfo.collection && nfo.token) {
      const tokenId = buildTokenId(nfo.collection, nfo.token);
      expect(tokenId).toEqual('8048de2d-8092-3ccc-a47d-e30da9764f05');

      const res = buildCollectibleMemo('', nfo.collection, nfo.token);
      const hex = base64RawURLDecode(res).toString('hex');
      // Compare without content
      expect(hex.slice(0, hex.length - 2)).toEqual(memo.slice(0, memo.length - 66));
    }
  });
});
