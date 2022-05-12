const { Client } = require('mixin-node-sdk'); // >= 3.0.13
const keystore = require('./keystore.json');
const { v4: uuid } = require('uuid');
const client = new Client(keystore);
const isMint = true;

async function main() {
  if (isMint) {
    const id = uuid();
    const tr = client.newMintCollectibleTransferInput({
      trace_id: id,
      collection_id: id,
      token_id: id,
      content: 'test',
    });
    const payment = await client.verifyPayment(tr);
    console.log('mint collectibles', id, 'mixin://codes/' + payment.code_id);
    return;
  }
  const outputs = await client.readCollectibleOutputs([client.keystore.client_id], 1);
  console.log(outputs);

  outputs.forEach(async output => {
    switch (output.state) {
      case 'unspent':
        const token = await client.readCollectibleToken(ctx, output.token_id);
        handleUnspentOutput(output, token);
        break;
      case 'signed':
        handleSignedOutput(output);
        break;
    }
  });
}

async function handleUnspentOutput(output, token) {
  console.log(`handle unspent output ${output.output_id} ${token.token_id}`);
  const receivers = ['e8e8cd79-cd40-4796-8c54-3a13cfe50115'];
  const signedTx = await client.makeCollectibleTransactionRaw({
    output,
    token,
    receivers,
    threshold: 1,
  });
  const createRes = await client.createCollectibleRequest('sign', signedTx);
  console.log('create collectible...', req);
  const signRes = await client.signCollectibleRequest(createRes.request_id);
  console.log('sign finished...', signRes);
}

async function handleSignedOutput(output) {
  console.log(`handle signed output ${output.output_id}`);
  const res = await sendExternalProxy('sendrawtransaction', output.signed_tx);
  console.log('send raw transaction finished...', res);
}
main();
