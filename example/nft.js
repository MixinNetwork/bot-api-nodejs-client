const { MixinApi, sleep, buildTokenId, buildNfoTransferRequest } = require('..');
const botKeystore = require('../keystore.json');

const owner = 'user'; // bot

// If it's the mixin user owns the nft, get user oauth using /oauth/token api
const keystore = {
  app_id: botKeystore.app_id,
  scope: 'PROFILE:READ COLLECTIBLES:READ',
  authorization_id: '',
  private_key: '',
  pin_token: botKeystore.pin_token,
};

const client = MixinApi({
  keystore: owner === 'user' ? keystore : botKeystore,
  requestConfig: {
    responseCallback(e) {
      console.log(e.response);
    },
  },
});

const readCollectibleOutput = async (id, receivers, offset = '') => {
  let new_offset = offset;
  const outputs = await client.collection.outputs({
    offset,
    limit: 500,
    members: receivers,
    threshold: 1,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const output of outputs) {
    if (output.token_id === id && output.state === 'unspent') return output; //
    new_offset = output.created_at;
  }

  await sleep(500);
  return readCollectibleOutput(id, receivers, new_offset);
};

async function main() {
  const user = await client.user.profile();
  // The mixin user or multisigs account that user want transfer the nft to
  const receivers = [owner === 'user' ? botKeystore.app_id : '7766b24c-1a03-4c3a-83a3-b4358266875d'];
  const threshold = 1;

  // The nft token information that user owns
  const collectionId = 'dbef5999-fcb1-4f58-b84f-6b7af9694280';
  const tokenId = 354;
  const tokenUuid = buildTokenId(collectionId, tokenId);

  // Fetch the transaction that user received nft token
  const utxo = await readCollectibleOutput(tokenUuid, [user.app_id]);
  console.log(utxo);

  const multisig = await buildNfoTransferRequest(client, utxo, receivers, threshold, Buffer.from('test').toString('hex'));
  console.log(multisig);

  // If a bot owns the nft, sign the transaction
  // Otherwise, let user sign in the mixin messenger
  let raw_transaction;
  if (user.app) {
    const signed = await client.collection.sign(botKeystore.pin, multisig.request_id);
    raw_transaction = signed.raw_transaction;
  } else {
    console.log('Sign in messenger');
    console.log(`mixin://codes/${multisig.code_id}`);
    raw_transaction = await new Promise(resolve => {
      const timer = setInterval(async () => {
        const payment = await client.code.fetch(multisig.code_id);
        if (payment.state === 'signed') {
          clearInterval(timer);
          resolve(payment.raw_transaction);
        }
      }, 1000);
    });
  }

  console.log('send to mainnet...');
  console.log(raw_transaction);
  const res = await client.external.proxy({
    method: 'sendrawtransaction',
    params: [raw_transaction],
  });
  console.log(res);
}

main();
