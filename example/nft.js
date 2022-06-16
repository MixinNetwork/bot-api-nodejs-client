const { 
  MixinApi, 
  MintAssetID, 
  MintMinimumCost, 
  buildMintCollectibleMemo, 
  GroupMembers, 
  GroupThreshold,
  TxVersion,
  DumpOutputFromGhostKey,
  dumpTransaction
} = require('mixin-node-sdk');
const { v4: uuid } = require('uuid');
const keystore = require('../keystore.json');

const client = MixinApi({ keystore });
const isMint = true;

async function main() {
  if (isMint) {
    const id = uuid();
    const collection_id = id;
    const token_id = id;
    const content = 'test';
    
    const tr = {
      asset_id: MintAssetID,
      amount: MintMinimumCost,
      memo: buildMintCollectibleMemo(collection_id, token_id, content),
      trace_id: id,
      opponent_multisig: {
        receivers: GroupMembers,
        threshold: GroupThreshold,
      }
    };

    const payment = await client.payment.request(tr);
    console.log('mint collectibles', id, `mixin://codes/${ payment.code_id }`);
    return;
  }
  const outputs = await client.collection.outputs({
    members: [keystore.client_id],
    threshold: 1,
  });
  console.log(outputs);

  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];
    
    switch (output.state) {
    case 'unspent':
      client.collection.fetch(output.token_id).then(token => handleUnspentOutput(output, token));
      break;
    case 'signed':
      handleSignedOutput(output);
      break;
    default:
      break;
    }
  }
}

async function handleUnspentOutput(output, token) {
  console.log(`handle unspent output ${output.output_id} ${token.token_id}`);

  const receivers = ['e8e8cd79-cd40-4796-8c54-3a13cfe50115'];
  const tx = {
    version: TxVersion,
    asset: token.mixin_id,
    extra: token.nfo,
    inputs: [
      {
        hash: output.transaction_hash,
        index: output.output_index
      }
    ]
  };
  const ghostInputs = client.transfer.outputs({
    receivers,
    index: 0,
    hint: output.output_id
  });
  tx.outputs = [
    DumpOutputFromGhostKey(ghostInputs[0], output.amount, 1)
  ];
  const signedTx = dumpTransaction(tx);

  const createRes = await client.collection.request({
    action: 'sign',
    raw: signedTx
  });
  console.log('create collectible...', createRes);
  const signRes = await client.collection.sign(keystore.pin, createRes.request_id);
  console.log('sign finished...', signRes);
}

function handleSignedOutput(output) {
  console.log(`handle signed output ${output.output_id}`);
  client.external.proxy({
    method: 'sendrawtransaction',
    params: output.signed_tx
  }).then(res => console.log('send raw transaction finished...', res));
}

main();
