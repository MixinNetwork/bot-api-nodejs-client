import { Wallet } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import BridgeApi from '../../src/mvm/bridge/client';

describe('Tests for BridgeApi', () => {
  const api = BridgeApi();

  test('Test for register', async () => {
    const result = await api.register({
      public_key: '0x914DFf811EF12267e1b644d9cb9B65743B98B131',
    });

    expect(result.contract).toEqual('0x5b6e9BdeD656F70314f9CE818aFF2Af83a2D2f0D');
    expect(result.created_at).toEqual('2022-06-22T11:08:22.48765745Z');
    expect(result.full_name).toEqual('0x914DFf811EF12267e1b644d9cb9B65743B98B131');
    expect(result.user_id).toEqual('3da8327c-aabf-3636-a8ab-3b7990f9bf60');
  });

  test('Test for register, use signature', async () => {
    const api = BridgeApi('https://bridge.pinstripe.mvm.dev');

    const wallet = new Wallet('3b793568539ae0211ce15502a7e8b460f76754eb824cf3d59839efe636bbeab5');

    const message = keccak256(toUtf8Bytes(`MVM:Bridge:Proxy:8MfEmL3g8s-PoDpZ4OcDCUDQPDiH4u1_OmxB0Aaknzg:${wallet.address}`));

    const signature = (await wallet.signMessage(message)).slice(2);

    const result = await api.register({
      public_key: wallet.address,
      signature,
    });

    expect(result.created_at).toEqual('2022-07-01T05:37:41.675196103Z');
    expect(result.full_name).toEqual('0xE2aD78Fdf6C29338f5E2434380740ac889457256');
    expect(result.user_id).toEqual('8fb4f791-cdf3-30a0-a511-f56d6f3366ba');
  });

  test('Test for extra', async () => {
    const result = await api.generateExtra({
      receivers: ['fcb87491-4fa0-4c2f-b387-262b63cbc112'],
      threshold: 1,
      extra: 'Hello from MVM',
    });

    expect(result).toEqual(
      '0xbd67087276ce3263b9333aa337e212a4ef241988d19892fe4eff4935256087f4fdc5ecaa65034ffb618e84db0ba8da744ef9e8e4de63637893444e12e1b318c670dfec527b22726563656976657273223a5b2266636238373439312d346661302d346332662d623338372d323632623633636263313132225d2c227468726573686f6c64223a312c226578747261223a2248656c6c6f2066726f6d204d564d227d',
    );
  });
});
