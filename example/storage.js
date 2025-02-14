const {
  MixinApi,
  getRecipientForStorage,
  encodeSafeTransaction,
  getUnspentOutputsForRecipients,
  buildSafeTransactionRecipient,
  buildSafeTransaction,
  signSafeTransaction,
} = require('..');
const { v4 } = require('uuid');
const keystore = require('../keystore.json'); // keystore from your bot

let privateKey = '';

const main = async () => {
  const client = MixinApi({ keystore });
  const extra = Buffer.from(
    '0301050acdc56c8d087a301b21144b2ab5e1286b50a5d941ee02f62488db0308b943d2d6c4db1d1f598d6a8197daf51b68d7fc0ef139c4dec5a496bac9679563bd3127dbfb17b60698d36d45bc624c8e210b4c845233c99a7ae312a27e883a8aa8444b9ba312eb6037b384f6011418d8e6a489a1e32a172c56219563726941e2bbef47d12792d9583a68efc92d451e7b57fa739db17aa693cc1554b053e3d8d546c4908e06a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea9400000000000000000000000000000000000000000000000000000000000000000000006a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a0000000006ddf6e1d765a193d9cbe146ceeb79ac1cb485ed5f5b37913a8cf5857eff00a90b7065b1e3d17c45389d527f6b04c3cd58b86c731aa0fdb549b6d1bc03f82946e4b982550388271987bed3f574e7259fca44ec259bee744ef65fc5d9dbe50d000406030305000404000000060200013400000000604d160000000000520000000000000006ddf6e1d765a193d9cbe146ceeb79ac1cb485ed5f5b37913a8cf5857eff00a9080101231408fb17b60698d36d45bc624c8e210b4c845233c99a7ae312a27e883a8aa8444b9b000907040102000206079e0121100000004c697465636f696e20284d6978696e29030000004c54437700000068747470733a2f2f75706c6f6164732e6d6978696e2e6f6e652f6d6978696e2f6174746163686d656e74732f313733393030353832362d3264633161666133663333323766346432396362623032653362343163663537643438343266336334343465386538323938373136393961633433643231623200000000000000',
    'hex',
  );

  // destination
  const rp = getRecipientForStorage(extra);
  const recipients = [rp];

  // get unspent utxos
  const outputs = await client.utxo.safeOutputs({
    members: [keystore.app_id],
    threshold: 1,
    asset: 'c94ac88f-4671-3976-b60a-09064f1811e8',
    state: 'unspent',
  });
  const balance = await client.utxo.safeAssetBalance({
    members: [keystore.app_id],
    threshold: 1,
    asset: 'c94ac88f-4671-3976-b60a-09064f1811e8',
    state: 'unspent',
  });
  console.log(balance);

  // Get utxo inputs and change fot tx
  const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
  if (!change.isZero() && !change.isNegative()) {
    recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
  }
  console.log(recipients);

  // get ghost key to send tx to uuid multisigs
  const request_id = v4();
  // For Mixin Kernel Address start with 'XIN', get ghost key with getMainnetAddressGhostKey
  const ghosts = await client.utxo.ghostKey(recipients, request_id, privateKey);
  console.log(ghosts);

  // build safe transaction raw
  const tx = buildSafeTransaction(utxos, recipients, ghosts, extra);
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
