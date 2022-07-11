import { Wallet } from 'ethers';
import { BridgeApi, getBridgeExtra } from '../../src';

describe('Tests for BridgeApi', () => {
  test('Test for register', async () => {
    const api = BridgeApi();
    const privateKey = '3b793568539ae0211ce15502a7e8b460f76754eb824cf3d59839efe636bbeab5';

    const wallet = new Wallet(privateKey);
    const result = await api.register(wallet);

    expect(result.created_at).toEqual('2022-06-23T10:40:21.140700627Z');
    expect(result.full_name).toEqual('0xE2aD78Fdf6C29338f5E2434380740ac889457256');
    expect(result.user_id).toEqual('59bba472-b943-3cf0-a505-6289e56a719c');
  });

  test('Test for extra', async () => {
    const result = getBridgeExtra({
      receivers: ['fcb87491-4fa0-4c2f-b387-262b63cbc112'],
      threshold: 1,
      extra: 'Hello from MVM',
    });

    expect(result).toEqual(
      '0xbd67087276ce3263b9333aa337e212a4ef241988d19892fe4eff4935256087f4fdc5ecaa65034ffb618e84db0ba8da744ef9e8e4de63637893444e12e1b318c670dfec527b22726563656976657273223a5b2266636238373439312d346661302d346332662d623338372d323632623633636263313132225d2c227468726573686f6c64223a312c226578747261223a2248656c6c6f2066726f6d204d564d227d',
    );
  });
});
