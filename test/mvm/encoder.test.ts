import Encoder from '../../src/mvm/encoder';

describe('Tests for encoder', () => {
  const encoder = new Encoder(Buffer.from('abc'));

  test('Test for encoder', () => {
    expect(encoder.hex()).toMatch('616263');

    encoder.write(Buffer.from('abc'));
    expect(encoder.hex()).toMatch('616263616263');
  });
});
