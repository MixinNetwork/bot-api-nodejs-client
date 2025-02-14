const {
  MixinApi,
  MixinCashier,
  buildSafeTransactionRecipient,
  getUnspentOutputsForRecipients,
  buildSafeTransaction,
  encodeSafeTransaction,
  signSafeTransaction,
  blake3Hash,
} = require('..');
const { v4 } = require('uuid');
const keystore = require('../keystore.json');

const withdrawal_asset_id = 'b91e18ff-a9ae-3dc7-8679-e935d9a4b34b';
const withdrawal_amount = '1';
const withdrawal_memo = 'memo';
const withdrawal_destination = '';
const spendPrivateKey = '';

const main = async () => {
  const client = MixinApi({ keystore });

  const asset = await client.safe.fetchAsset(withdrawal_asset_id);
  const chain = asset.chain_id === asset.asset_id ? asset : await client.safe.fetchAsset(asset.chain_id);
  const fees = await client.safe.fetchFee(asset.asset_id, withdrawal_destination);
  const assetFee = fees.find(f => f.asset_id === asset.asset_id);
  const chainFee = fees.find(f => f.asset_id === chain.asset_id);
  const fee = assetFee ?? chainFee;
  console.log(fee);

  // withdrawal with chain asset as fee
  if (fee.asset_id !== asset.asset_id) {
    const outputs = await client.utxo.safeOutputs({
      asset: withdrawal_asset_id,
      state: 'unspent',
    });
    const feeOutputs = await client.utxo.safeOutputs({
      asset: fee.asset_id,
      state: 'unspent',
    });
    console.log(outputs, feeOutputs);

    let recipients = [
      // withdrawal output, must be put first
      {
        amount: withdrawal_amount,
        destination: withdrawal_destination,
        tag: withdrawal_memo,
      },
    ];
    const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
    if (!change.isZero() && !change.isNegative()) {
      // add change output if needed
      recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
    }
    // the index of ghost keys must be the same with the index of outputs
    // but withdrawal output doesnt need ghost key
    // get ghost key to send tx
    const txId = v4();
    const ghosts = await client.utxo.ghostKey(recipients, txId, spendPrivateKey);

    // spare the 0 inedx for withdrawal output, withdrawal output doesnt need ghost key
    const tx = buildSafeTransaction(utxos, recipients, [undefined, ...ghosts], Buffer.from('mainnet-transaction-extra'));
    console.log(tx);
    const raw = encodeSafeTransaction(tx);
    const ref = blake3Hash(Buffer.from(raw, 'hex')).toString('hex');

    const feeRecipients = [
      // fee output
      buildSafeTransactionRecipient([MixinCashier], 1, fee.amount),
    ];
    const { utxos: feeUtxos, change: feeChange } = getUnspentOutputsForRecipients(feeOutputs, feeRecipients);
    if (!feeChange.isZero() && !feeChange.isNegative()) {
      // add fee change output if needed
      feeRecipients.push(buildSafeTransactionRecipient(feeOutputs[0].receivers, feeOutputs[0].receivers_threshold, feeChange.toString()));
    }
    const feeId = v4();
    const feeGhosts = await client.utxo.ghostKey(feeRecipients, feeId, spendPrivateKey);
    const feeTx = buildSafeTransaction(feeUtxos, feeRecipients, feeGhosts, Buffer.from('mainnet-fee-transaction-extra'), [ref]);
    console.log(feeTx);
    const feeRaw = encodeSafeTransaction(feeTx);
    console.log(feeRaw);

    console.log(txId, feeId);
    let txs = await client.utxo.verifyTransaction([
      {
        raw,
        request_id: txId,
      },
      {
        raw: feeRaw,
        request_id: feeId,
      },
    ]);

    const signedRaw = signSafeTransaction(tx, txs[0].views, spendPrivateKey);
    const signedFeeRaw = signSafeTransaction(feeTx, txs[1].views, spendPrivateKey);
    const res = await client.utxo.sendTransactions([
      {
        raw: signedRaw,
        request_id: txId,
      },
      {
        raw: signedFeeRaw,
        request_id: feeId,
      },
    ]);
    console.log(res);
  }
  // withdrawal with asset as fee
  else {
    const outputs = await client.utxo.safeOutputs({
      asset: withdrawal_asset_id,
      state: 'unspent',
    });
    console.log(outputs);

    let recipients = [
      // withdrawal output, must be put first
      {
        amount: withdrawal_amount,
        destination: withdrawal_destination,
        tag: withdrawal_memo,
      },
      // fee output
      buildSafeTransactionRecipient([MixinCashier], 1, fee.amount),
    ];
    const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
    if (!change.isZero() && !change.isNegative()) {
      // add change output if needed
      recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
    }
    // the index of ghost keys must be the same with the index of outputs
    // but withdrawal output doesnt need ghost key
    const request_id = v4();
    console.log(request_id);
    const ghosts = await client.utxo.ghostKey(recipients, request_id, spendPrivateKey);
    // spare the 0 inedx for withdrawal output, withdrawal output doesnt need ghost key
    const tx = buildSafeTransaction(utxos, recipients, [undefined, ...ghosts], Buffer.from('mainnet-transaction-extra'));
    console.log(tx);
    const raw = encodeSafeTransaction(tx);

    let txs = await client.utxo.verifyTransaction([
      {
        raw,
        request_id,
      },
    ]);

    const signedRaw = signSafeTransaction(tx, txs[0].views, spendPrivateKey);
    const res = await client.utxo.sendTransactions([
      {
        raw: signedRaw,
        request_id,
      },
    ]);
    console.log(res);
  }
};

main();
