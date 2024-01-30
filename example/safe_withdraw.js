const { MixinApi, MixinCashier, buildSafeTransactionRecipient, getUnspentOutputsForRecipients, buildSafeTransaction, encodeSafeTransaction, signSafeTransaction } = require('..');
const { v4 } = require('uuid');
const keystore = require('../keystore.json');

const withdrawal_asset_id = '4d8c508b-91c5-375b-92b0-ee702ed2dac5';
const withdrawal_amount = '1';
const withdrawal_destination = '0xA03A8590BB3A2cA5c747c8b99C63DA399424a055';
const safePrivateKey = '';

const main = async () => {
  const client = MixinApi({ keystore });

  const asset = await client.safe.fetchAsset(withdrawal_asset_id);
  const chain = asset.chain_id === asset.asset_id ? asset : await client.safe.fetchAsset(asset.chain_id);
  const fees = await client.safe.fetchFee(asset.asset_id, withdrawal_destination);
  const assetFee = fees.find(f => f.asset_id === asset.asset_id);
  const chainFee = fees.find(f => f.asset_id === chain.asset_id);
  const fee = assetFee ?? chainFee;
  console.log(fee);

  if (fee.asset_id !== asset.asset_id) {
    const outputs = await client.utxo.safeOutputs({
      asset: withdrawal_asset_id,
    });
    console.log(outputs);
    // withdrawal and change
    let recipients = [
      {
        amount: withdrawal_amount,
        destination: withdrawal_destination,
      },
    ];
    const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
    if (!change.isZero() && !change.isNegative()) {
      recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
    }
    const ghosts = await client.utxo.ghostKey(
      recipients.map((r, i) => ({
        hint: v4(),
        receivers: r.members,
        index: i,
      })),
    );
    const tx = buildSafeTransaction(utxos, recipients, ghosts, 'withdrawal-memo');
    const raw = encodeSafeTransaction(tx);

    const feeOutputs = await client.utxo.safeOutputs({
      asset: fee.asset_id,
    });
    // fee and fee change
    const feeRecipients = [buildSafeTransactionRecipient([MixinCashier], 1, fee.amount)];
    const { utxos: feeUtxos, change: feeChange } = getUnspentOutputsForRecipients(feeOutputs, feeRecipients);
    if (!feeChange.isZero() && !feeChange.isNegative()) {
      feeRecipients.push(buildSafeTransactionRecipient(feeOutputs[0].receivers, feeOutputs[0].receivers_threshold, feeChange.toString()));
    }
    const feeGhosts = await client.utxo.ghostKey(
      feeRecipients.map((r, i) => ({
        hint: v4(),
        receivers: r.members,
        index: i,
      })),
    );
    const feeTx = buildSafeTransaction(feeUtxos, feeRecipients, feeGhosts, 'withdrawal-fee-memo');
    const feeRaw = encodeSafeTransaction(feeTx);

    const txId = v4();
    const feeId = v4();
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

    // sign safe multisigs with the private key registerd to safe
    const signedRaw = signSafeTransaction(tx, txs[0].views, safePrivateKey);
    const signedFeeRaw = signSafeTransaction(feeTx, txs[1].views, safePrivateKey);
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
  } else {
    const outputs = await client.utxo.safeOutputs({
      asset: withdrawal_asset_id,
    });
    console.log(outputs);
    // withdrawal, fee and change
    let recipients = [
      {
        amount: withdrawal_amount,
        destination: withdrawal_destination,
      },
      buildSafeTransactionRecipient([MixinCashier], 1, fee.amount),
    ];
    const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
    if (!change.isZero() && !change.isNegative()) {
      recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
    }
    const ghosts = await client.utxo.ghostKey(
      recipients.filter(r => 'members' in r).map((r, i) => ({
        hint: v4(),
        receivers: r.members,
        index: i,
      })),
    );
    const tx = buildSafeTransaction(utxos, recipients, [undefined, ...ghosts], 'withdrawal-memo');
    console.log(tx)
    tx.outputs.forEach(o => console.log(o))
    const raw = encodeSafeTransaction(tx);

    const request_id = v4();
    console.log(request_id);
    let txs = await client.utxo.verifyTransaction([
      {
        raw,
        request_id,
      },
    ]);

    const signedRaw = signSafeTransaction(tx, txs[0].views, safePrivateKey);
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
