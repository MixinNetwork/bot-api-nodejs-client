import Code from '../../src/client/code';

describe('Tests for codes', () => {
  const code = Code();
  test('Test for fetch conversation', async () => {
    const resp = await code.fetch('99f90817-9b2a-4d39-ba53-ab2cf0aa2440');
    expect(resp.type).toMatch('conversation');
  });
});
