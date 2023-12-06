const { MixinApi, encodeSafeTransaction, getUnspentOutputsForRecipients, buildSafeTransactionRecipient, buildSafeTransaction, signSafeTransaction } = require('..');
const { v4 } = require('uuid');
const keystore = require('../keystore.json'); // keystore from your bot

const safePrivateKey = '';

// multisigs
const members = [keystore.client_id, '7766b24c-1a03-4c3a-83a3-b4358266875d'];
const threshold = 1;
// destination
const recipients = [buildSafeTransactionRecipient([keystore.client_id], 1, '0.0001')];

const main = async () => {
  const client = MixinApi({ keystore });

  // get unspent utxos
  const outputs = await client.utxo.safeOutputs({
    members,
    threshold,
    asset: 'f3bed3e0f6738938c8988eb8853c5647baa263901deb217ee53586d5de831f3b',
    state: 'unspent',
  });

  // Get utxo inputs and change fot tx
  const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
  if (!change.isZero() && !change.isNegative()) {
    recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
  }
  // get ghost key to send tx to uuid multisigs
  // For Mixin Kernel Address start with 'XIN', get ghost key with getMainnetAddressGhostKey
  const ghosts = await client.utxo.ghostKey(
    recipients.map((r, i) => ({
      hint: v4(),
      receivers: r.members,
      index: i,
    })),
  );

  // build safe transaction raw
  const tx = buildSafeTransaction(utxos, recipients, ghosts, 'multisigs-test-memo');
  console.log(tx);
  const raw = encodeSafeTransaction(tx);

  // create multisig tx
  const request_id = v4();
  console.log(request_id);
  let multisig = await client.multisig.createSafeMultisigs([
    {
      raw,
      request_id,
    },
  ]);
  console.log(multisig);

  // unlock multisig tx
  const unlock = await client.multisig.unlockSafeMultisigs(request_id);
  console.log('unlock');
  console.log(unlock);

  // you can continue to sign this unlocked multisig tx
  const index = outputs[0].receivers.sort().findIndex(u => u === keystore.client_id);
  // sign safe multisigs with the private key registerd to safe
  const signedRaw = await signSafeTransaction(tx, multisig[0].views, safePrivateKey, index);
  multisig = await client.multisig.signSafeMultisigs(request_id, signedRaw);
  console.log(multisig);
};

main();
