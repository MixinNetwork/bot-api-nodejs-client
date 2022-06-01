import Code from '../../src/client/code';

describe('Tests for codes', () => {
  const code = Code({});
  test('Test for fetch conversation', async () => {
    const resp = await code.fetch('50d49416-dcf5-4f8b-ae98-b7836a26a84a');
    expect(resp.type).toMatch('conversation');
  });
});
