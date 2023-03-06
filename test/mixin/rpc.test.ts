import { RpcClient } from '../../src';

jest.setTimeout(30000);

const client = RpcClient();

describe('Tests for rpc', () => {
  test('Test for rpc', async () => {
    const nodeInfo = await client.getInfo();
    expect(nodeInfo.node).toEqual('3bdca8b8a593d9c5882532735622170bce2a1452d47cdeee5f950800593ef0bb');

    const utxo = await client.getUTXO('fb4f927f3f04bdf34fcd26056e84214edb7e8c9737ddf4c7e6829caaf8e54e27', '1');
    expect(utxo.hash).toEqual('fb4f927f3f04bdf34fcd26056e84214edb7e8c9737ddf4c7e6829caaf8e54e27');

    const tx = await client.getTransaction('1453961d4f880775fa94c604b630a3662e99d83187b8f33e25e59d9ae4d8c4b6');
    expect(tx.hash).toEqual('1453961d4f880775fa94c604b630a3662e99d83187b8f33e25e59d9ae4d8c4b6');

    const key = await client.getKey('29ecfd9fb1eca4d9375da58fd526ae91b22a244d6ee48b81f8f7915530239324');
    expect(key.transaction).toEqual('1453961d4f880775fa94c604b630a3662e99d83187b8f33e25e59d9ae4d8c4b6');

    const snapshot = await client.getSnapshot('2714982c8c675f42f1198af2c8d1c5f7444b4f42abf75e4ec7c1e541802e47d7');
    expect(snapshot.hash).toEqual('2714982c8c675f42f1198af2c8d1c5f7444b4f42abf75e4ec7c1e541802e47d7');

    const snapshots = await client.listSnapshots('0', '10', true, true);
    expect(snapshots.length).toEqual(10);

    const roundByNumber = await client.getRoundByNumber('f3aa49c73bd64cec574aad27870968c8c3be40d0537040ff0252f35b8507de3f', '362153');
    expect(roundByNumber.number).toEqual(362153);

    const roundByHash = await client.getRoundByHash('5691c08eef98d40e2efb3a770c0257e1ffb45e480184a4349c9423ca2ac9fd30');
    expect(roundByHash.number).toEqual(362153);
  });
});
