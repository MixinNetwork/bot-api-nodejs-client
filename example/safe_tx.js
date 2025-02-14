const { MixinApi, encodeSafeTransaction, getUnspentOutputsForRecipients, buildSafeTransactionRecipient, buildSafeTransaction, signSafeTransaction } = require('..');
const { v4 } = require('uuid');
const keystore = require('../keystore.json'); // keystore from your bot

let privateKey = '';

const main = async () => {
  const client = MixinApi({ keystore });

  // destination
  const members = ['7766b24c-1a03-4c3a-83a3-b4358266875d'];
  const threshold = 1;
  const recipients = [buildSafeTransactionRecipient(members, threshold, '1')];

  // get unspent utxos
  const outputs = await client.utxo.safeOutputs({
    members: [keystore.client_id],
    threshold: 1,
    asset: 'f3bed3e0f6738938c8988eb8853c5647baa263901deb217ee53586d5de831f3b',
    state: 'unspent',
  });
  console.log(outputs);
  const balance = await client.utxo.safeAssetBalance({
    members: [keystore.client_id],
    threshold: 1,
    asset: 'f3bed3e0f6738938c8988eb8853c5647baa263901deb217ee53586d5de831f3b',
    state: 'unspent',
  });
  console.log(balance);

  // Get utxo inputs and change fot tx
  const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
  if (!change.isZero() && !change.isNegative()) {
    recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
  }

  // get ghost key to send tx
  const request_id = v4();
  const ghosts = await client.utxo.ghostKey(recipients, request_id, privateKey);
  console.log(ghosts);

  // build safe transaction raw
  const tx = buildSafeTransaction(utxos, recipients, ghosts, Buffer.from('test-memo'));
  console.log(tx);
  const raw = encodeSafeTransaction(tx);
  console.log(raw);

  // verify safe transaction
  const verifiedTx = await client.utxo.verifyTransaction([
    {
      raw,
      request_id,
    },
  ]);
  console.log(verifiedTx);

  // sign safe transaction with the private key registerd to safe
  const signedRaw = signSafeTransaction(tx, verifiedTx[0].views, privateKey);
  console.log(signedRaw);
  const sendedTx = await client.utxo.sendTransactions([
    {
      raw: signedRaw,
      request_id,
    },
  ]);
  console.log(sendedTx);
};

main();
