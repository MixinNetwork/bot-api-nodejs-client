import { stringify } from "uuid";
import forge from 'node-forge';
import { decodeNfoMemo } from '../../src';

describe('Tests for nfo', () => {
  test('Test for fetch conversation', async () => {
    const memo = '4e464f0001000000000000000143d61dcde413450d80b8101d5e903357143c8c161a18ae2c8b14fda1216fff7da88c419b5d103676a640111b42e4923efc4c68d6de400106204d27df6617015c7da6f606106a7f751bc1175b3fcee7ba3eea2e9fec693cff77';
    const nfo = decodeNfoMemo(memo);
    if (nfo.chain && nfo.class && nfo.collection && nfo.token) {
      const msg = nfo.chain.replaceAll('-', '') + nfo.class + nfo.collection.replaceAll('-', '') + nfo.token;
      const md5 = forge.md.md5.create();
      md5.update(Buffer.from(msg, 'hex').toString('binary'))
      const bytes = Buffer.from(md5.digest().bytes(), 'binary');

      bytes[6] = (bytes[6] & 0x0f) | 0x30;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const tokenId = stringify(bytes);
      expect(tokenId).toEqual("8048de2d-8092-3ccc-a47d-e30da9764f05");
    }
  });
});
