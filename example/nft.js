const { v4: uuid } = require('uuid');
const { MixinApi, MixinAssetID, MintMinimumCost, GroupMembers, GroupThreshold, buildMintCollectibleMemo } = require('..');
const keystore = require('../keystore.json');

const client = MixinApi({ keystore });

async function main() {
  const id = uuid();
  const tr = {
    asset_id: MixinAssetID,
    amount: MintMinimumCost,
    memo: buildMintCollectibleMemo(id, id, 'test'),
    trace_id: id,
    opponent_multisig: {
      receivers: GroupMembers,
      threshold: GroupThreshold,
    },
  };

  const payment = await client.payment.request(tr);
  console.log('mint collectibles', id, `mixin://codes/${payment.code_id}`);
}

main();
