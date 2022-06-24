import Registry from '../../src/mvm/registry';
import { BlankAddress, MVMTestnet } from '../../src';

describe('Tests for registry', () => {
  const registry = new Registry({ address: MVMTestnet.Registry.Contract, uri: MVMTestnet.RPCUri});

  test('Test for fetch mvm address of mixin asset', async () => {
    const address = await registry.fetchAssetContract('965e5c6e-434c-3fa9-b780-c50f43cd955c');
    expect(address).toMatch('0x9896c802e143A59A98c0C26bBa6d11C1AAF4A023');
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
    const address = await registry.fetchUsersContract(['e9e5b807-fa8b-455a-8dfa-b189d28310ff'], 1);
    expect(address).toMatch('0xc09516323c601006DbaDb330778fADCE08593252');
  });

  test('Test for fetch mvm address of a mixin user without threshold', async () => {
    const address = await registry.fetchUserContract('e9e5b807-fa8b-455a-8dfa-b189d28310ff');
    expect(address).toMatch('0xc09516323c601006DbaDb330778fADCE08593252');
  });
});
