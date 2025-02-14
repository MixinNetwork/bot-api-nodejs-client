const {
  MixinApi,
  encodeSafeTransaction,
  getUnspentOutputsForRecipients,
  buildSafeTransactionRecipient,
  buildSafeTransaction,
  signSafeTransaction,
  decodeSafeTransaction,
} = require('..');
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
  // get ghost key to send tx
  const request_id = v4();
  const ghosts = await client.utxo.ghostKey(recipients, request_id, safePrivateKey);

  // build safe transaction raw
  const tx = buildSafeTransaction(utxos, recipients, ghosts, Buffer.from('multisigs-test-memo'));
  console.log(tx);
  const raw = encodeSafeTransaction(tx);

  // create multisig tx
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
  const signedRaw = signSafeTransaction(tx, multisig[0].views, safePrivateKey, index);
  multisig = await client.multisig.signSafeMultisigs(request_id, signedRaw);
  console.log(multisig);

  // others in the gourp are required to sign the multisigs transaction
  otherSign(multisig.request_id);
};

const otherSign = async id => {
  const keystore = {
    client_id: '',
    session_id: '',
    pin_token: '',
    private_key: '',
  };
  const privateKey = '';

  const client = MixinApi({ keystore });
  let multisig = await client.multisig.fetchSafeMultisigs(id);
  const tx = decodeSafeTransaction(multisig.raw_transaction);

  const index = multisig.senders.sort().findIndex(u => u === keystore.client_id);
  // sign safe multisigs with the private key registerd to safe
  const signedRaw = signSafeTransaction(tx, multisig.views, privateKey, index);
  multisig = await client.multisig.signSafeMultisigs(id, signedRaw);
  console.log(multisig);
};

main();
