import Registry from '../../src/mvm/registry';
import { BlankAddress, MVMMainnet } from '../../src';

describe('Tests for registry', () => {
  const registry = new Registry({ address: MVMMainnet.Registry.Contract, uri: MVMMainnet.RPCUri });

  test('Test for fetch mvm address of mixin asset', async () => {
    const address = await registry.fetchAssetContract('965e5c6e-434c-3fa9-b780-c50f43cd955c');
    expect(address).toMatch('0x910Fb1751B946C7D691905349eC5dD250EFBF40a');
  });

  test('Test for fetch invalid mvm address of mixin asset', async () => {
    const address = await registry.fetchAssetContract('e9e5b807-fa8b-455a-8dfa-b189d28310ff');
    expect(address).toMatch(BlankAddress);
  });

  test('Test for fetch invalid mvm address of mixin user', async () => {
    const address = await registry.fetchUsersContract(['965e5c6e-434c-3fa9-b780-c50f43cd955c'], 1);
    expect(address).toMatch(BlankAddress);
  });

  test('Test for fetch mvm address of mixin user', async () => {
    const address = await registry.fetchUsersContract(['c5745a41-6dc6-3668-8978-6fdc009f7ded'], 1);
    expect(address).toMatch('0x7B81987bF2E1869c0bfc9ae22C83EA99eFd53339');
  });

  test('Test for fetch mvm address of a mixin user without threshold', async () => {
    const address = await registry.fetchUserContract('c5745a41-6dc6-3668-8978-6fdc009f7ded');
    expect(address).toMatch('0x7B81987bF2E1869c0bfc9ae22C83EA99eFd53339');
  });
});
