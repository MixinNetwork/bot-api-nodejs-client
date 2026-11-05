import Network from '../../src/client/network';
import { describeIntegration } from '../integration';
import keystore from '../keystore';

describeIntegration('Tests for network', () => {
  const network = Network({ keystore });
  test('Test for fetch network chains', async () => {
    const resp = await network.chains();
    console.log(resp.length);
  });
});
