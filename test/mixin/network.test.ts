import Network from '../../src/client/network';

describe('Tests for network', () => {
  const network = Network();
  test('Test for fetch network chains', async () => {
    const resp = await network.chains();
    console.log(resp.length);
  });
});
