import { v4 } from 'uuid';
import { utils } from 'ethers';
import { MVMMainnet, getExtra, getBridgeExtra, BridgeApi } from '../src';
import { client } from './common';

const value = utils.id('GrayPigeon');
const key = utils.keccak256(value);
console.log(key);

describe('address', () => {

  // const contract1 = ({
  //   address: MVMMainnet.Refund.Contract,
  //   method: 'work',
  // });
  const contract2 = ({
    address: MVMMainnet.Storage.Contract,
    method: 'read',
    types: ['uint256'],
    values: [key],
  });

  it('extra', async () => {

    const contracts = [contract2];
    const extra = getExtra(contracts);
    console.log(extra);

    const input = {
      asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
      amount: '0.00000001',
      trace_id: v4(),
      opponent_multisig: {
        receivers: MVMMainnet.MVMMembers,
        threshold: MVMMainnet.MVMThreshold
      },
      memo: extra
    };

    const tx = await client.payment.request(input);
    // console.log(tx);
    console.log(`mixin://codes/${tx.code_id}`);

  });

  it('Bridge extra', async () => {
    const payload = {
      receivers: ['d53acaa9-6e20-4e35-9cf8-3ea25186e235'],
      threshold: 1,
      extra: '123',
    };
    const extra = getBridgeExtra(payload);

    const client = BridgeApi();
    const remoteExtra = await client.generateExtra(payload);
    expect(extra).toEqual(remoteExtra);
  });
});