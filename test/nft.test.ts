import { v4 as uuid } from 'uuid';
import { client } from './common';
import { MintAssetID, MintMinimumCost, GroupMembers, GroupThreshold } from '../src/client/collectible';
import { buildMintCollectibleMemo } from '../src';

describe('address', () => {
  it('create nft', async () => {
    const id = uuid();
    const tr = {
      asset_id: MintAssetID,
      amount: MintMinimumCost,
      trace_id: id,
      memo: buildMintCollectibleMemo(id, id, 'test'),
      opponent_multisig: {
        receivers: GroupMembers,
        threshold: GroupThreshold
      }
    };

    const payment = await client.payment.request(tr);
    console.log('mint collectibles', id, `mixin://codes/${payment.code_id}`);
    expect(payment.trace_id).toEqual(id);
  });
});
