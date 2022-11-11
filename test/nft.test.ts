import { v4 as uuid } from 'uuid';
import { client } from './common';
import { MintMinimumCost, GroupMembers, GroupThreshold } from '../src/client/collectible';
import { buildCollectibleMemo, MixinAssetID } from '../src';

describe('address', () => {
  it('create nft', async () => {
    const id = uuid();
    const tr = {
      asset_id: MixinAssetID,
      amount: MintMinimumCost,
      trace_id: id,
      memo: buildCollectibleMemo(id, 1, 'test'),
      opponent_multisig: {
        receivers: GroupMembers,
        threshold: GroupThreshold,
      },
    };

    const payment = await client.payment.request(tr);
    console.log('mint collectibles', id, `mixin://codes/${payment.code_id}`);
    expect(payment.trace_id).toEqual(id);
  });
});
