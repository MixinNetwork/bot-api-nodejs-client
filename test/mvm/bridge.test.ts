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
