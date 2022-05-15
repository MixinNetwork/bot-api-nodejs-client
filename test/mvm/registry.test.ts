import {
  MVMTestnet,
  RegistryContract,
  fetchAssetAddress,
} from '../../src/mvm/registry';

describe('Tests for registry', () => {
  test('Test for fetch mvm address of mixin asset', async () => {
    const registry = RegistryContract(MVMTestnet.Registry.Address, MVMTestnet.RPCUri);

    const address = await fetchAssetAddress('965e5c6e-434c-3fa9-b780-c50f43cd955c', registry);
    expect(address).toMatch('0x155bDfAb24f07630C27a3F31634B33F94eC4A634');
  });
});
