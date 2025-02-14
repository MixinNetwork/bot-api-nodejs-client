const { v4 } = require('uuid');
const { MixinApi, buildMultiSigsTransaction, sleep, encodeScript } = require('..');
const keystore = require('../keystore.json');

const client = MixinApi({
  requestConfig: {
    responseCallback: err => {
      console.log(err);
    },
  },
  keystore,
});

const readOutput = async (hash, members, threshold, offset = '') => {
  let new_offset = offset;
  const outputs = await client.multisig.outputs({
    members,
    threshold,
    offset,
    limit: 10,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const output of outputs) {
    new_offset = output.updated_at;
    if (output.transaction_hash === hash) return output;
  }

  await sleep(1000 * 5);
  return readOutput(hash, members, threshold, new_offset);
};

const main = async () => {
  const bot = await client.user.profile();
  const asset_id = '965e5c6e-434c-3fa9-b780-c50f43cd955c';
  const amount = '0.0001';
  const members = [bot.app.creator_id, keystore.app_id];
  const threshold = 1;

  // 1. send to multisig account
  // should have balance in your bot
  const sendTxReceipt = await client.transfer.toAddress(keystore.pin, {
    asset_id,
    amount,
    trace_id: v4(),
    memo: 'send to multisig',
    opponent_multisig: {
      threshold,
      receivers: members,
    },
  });
  console.log('send to multi-signature account');
  console.log('transaction hash:', sendTxReceipt.transaction_hash);

  // 2. wait tx complete
  console.log('read transaction output...');
  const utxo = await readOutput(sendTxReceipt.transaction_hash, members, threshold, '');
  console.log(utxo);

  // 3. refund
  console.log('refund to bot:');
  const asset = await client.asset.fetch(asset_id);
  const receivers = await client.transfer.outputs([
    {
      receivers: [keystore.app_id],
      index: 0,
    },
  ]);
  console.log('generate raw transaction');
  const raw = buildMultiSigsTransaction({
    version: 2,
    asset: asset.mixin_id,
    inputs: [
      {
        hash: utxo.transaction_hash,
        index: utxo.output_index,
      },
    ],
    outputs: [
      {
        amount,
        mask: receivers[0].mask,
        keys: receivers[0].keys,
        script: encodeScript(threshold),
      },
    ],
    extra: 'refund',
  });

  // Generate a multi-signature
  console.log('generate a multi-signature request...');
  const multisig = await client.multisig.create('sign', raw);

  // Sign a multi-signature
  console.log('sign...');
  const signed = await client.multisig.sign(keystore.pin, multisig.request_id);
  console.log(signed);

  // Send signed tx to mainnet
  console.log('send to mainnet...');
  const res = await client.external.proxy({
    method: 'sendrawtransaction',
    params: [signed.raw_transaction],
  });
  console.log(res);
};

main();
