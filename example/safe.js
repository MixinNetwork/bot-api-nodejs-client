const {
  MixinApi,
  getED25519KeyPair,
  getTipPinUpdateMsg,
  base64RawURLDecode,
  encodeSafeTransaction,
  getUnspentOutputsForRecipients,
  buildSafeTransactionRecipient,
  buildSafeTransaction,
  signSafeTransaction,
} = require('..');
const { v4 } = require('uuid');
const keystore = require('../keystore.json'); // keystore from your bot

const main = async () => {
  const client = MixinApi({ keystore });
  let bot = await client.user.profile();

  // private key for safe registration
  let privateKey = '';
  // upgrade to tip pin if haven't
  if (!bot.tip_key_base64) {
    const keys = getED25519KeyPair();
    const pub = base64RawURLDecode(keys.publicKey);
    const priv = base64RawURLDecode(keys.privateKey);
    const tipPin = priv.toString('hex');
    privateKey = tipPin;

    const b = getTipPinUpdateMsg(pub, bot.tip_counter + 1);
    await client.pin.update(keystore.pin, b);
    bot = await client.pin.verifyTipPin(tipPin);
    keystore.pin = tipPin; // should update pin in your keystore file too
    console.log('new tip pin', tipPin);
  }

  // register to safe if haven't
  // it's convinient to use the same private key as above tipPin
  if (!bot.has_safe) {
    const resp = await client.safe.register(keystore.client_id, keystore.pin, privateKey);
    console.log(resp);
  }

  // destination
  const members = ['7766b24c-1a03-4c3a-83a3-b4358266875d'];
  const threshold = 1;
  const recipients = [buildSafeTransactionRecipient(members, threshold, '1')];

  // get unspent utxos
  const outputs = await client.utxo.safeOutputs({
    members: [keystore.client_id],
    threshold: 1,
    asset: 'edb4fe8b-8f05-32e3-a0e0-5d2096e7a7ac',
    state: 'unspent',
  });
  console.log(outputs);
  const balance = await client.utxo.safeAssetBalance({
    members: [keystore.client_id],
    threshold: 1,
    asset: 'edb4fe8b-8f05-32e3-a0e0-5d2096e7a7ac',
    state: 'unspent',
  });
  console.log(balance);

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
  console.log(ghosts)

  // build safe transaction raw
  const tx = buildSafeTransaction(utxos, recipients, ghosts, 'test-memo');
  console.log(tx);
  const raw = encodeSafeTransaction(tx);
  console.log(raw);

  // verify safe transaction
  const request_id = v4();
  const verifiedTx = await client.utxo.verifyTransaction([
    {
      raw,
      request_id,
    },
  ]);
  console.log(verifiedTx);

  // sign safe transaction with the private key registerd to safe
  const signedRaw = await signSafeTransaction(tx, verifiedTx[0].views, privateKey);
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
