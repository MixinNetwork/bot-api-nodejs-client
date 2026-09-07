import Network from '../../src/client/network';
import { describeIntegration } from '../integration';

describeIntegration('Tests for network', () => {
  const network = Network();
  test('Test for fetch network chains', async () => {
    const resp = await network.chains();
    console.log(resp.length);
  });
});
