import { Wallet } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import { BridgeApi, getBridgeExtra, getExtraWithStorageKey } from '../../src';

describe('Tests for BridgeApi', () => {
  const api = BridgeApi();

  const privateKey = '3b793568539ae0211ce15502a7e8b460f76754eb824cf3d59839efe636bbeab5';
  const wallet = new Wallet(privateKey);

  test('Test for register', async () => {
    const result = await api.register(wallet);

    expect(result.created_at).toEqual('2022-06-23T10:40:21.140700627Z');
    expect(result.full_name).toEqual('0xE2aD78Fdf6C29338f5E2434380740ac889457256');
    expect(result.user_id).toEqual('59bba472-b943-3cf0-a505-6289e56a719c');
  });

  test('Test for extra', async () => {
    const value = getBridgeExtra({
      receivers: ['fcb87491-4fa0-4c2f-b387-262b63cbc112'],
      threshold: 1,
      extra: 'Hello from MVM',
    });
    const key = keccak256(value);
    // Write to Storage Contract...
    const extra = getExtraWithStorageKey(key);
    console.log(extra);
  });
});