import {
  Blank,
  MVMTestnet,
  RegistryContract,
  fetchAssetAddress,
  fetchUsersAddress,
} from '../../src/mvm/registry';

describe('Tests for registry', () => {
  const registry = RegistryContract(MVMTestnet.Registry.Address, MVMTestnet.RPCUri);

  test('Test for fetch mvm address of mixin asset', async () => {
    const address = await fetchAssetAddress('965e5c6e-434c-3fa9-b780-c50f43cd955c', registry);
    expect(address).toMatch('0x155bDfAb24f07630C27a3F31634B33F94eC4A634');
  });

  test('Test for fetch invalid mvm address of mixin asset', async () => {
    const address = await fetchAssetAddress('e9e5b807-fa8b-455a-8dfa-b189d28310ff', registry);
    expect(address).toMatch(Blank);
  });

  test('Test for fetch mvm address of mixin user', async () => {
    const address = await fetchUsersAddress(['e9e5b807-fa8b-455a-8dfa-b189d28310ff'], 1, registry);
    expect(address).toMatch('0x8a9f2B6492A3E24B1D2b92ad29E80549Be6B21Cc');
  });


  test('Test for fetch invalid mvm address of mixin user', async () => {
    const address = await fetchUsersAddress(['965e5c6e-434c-3fa9-b780-c50f43cd955c'], 1, registry);
    expect(address).toMatch(Blank);
  });
});
