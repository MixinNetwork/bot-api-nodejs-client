const { MixinApi, getED25519KeyPair, getTipPin, base64RawURLDecode, encodeSafeTransaction, buildSafeTransactionRecipient, buildSafeTransaction } = require('..');
const forge = require('node-forge');
const { v4 } = require('uuid');
const keystore = require('../keystore.json'); // keystore from your bot

const main = async () => {
  const client = MixinApi({ keystore });
  let bot = await client.user.profile();

  if (!bot.tip_key_base64) {
    const keys = getED25519KeyPair();
    const pub = base64RawURLDecode(keys.publicKey);
    const priv = base64RawURLDecode(keys.privateKey);
    const tipPin = priv.toString('hex');

    const b = getTipPin(pub, bot.tip_counter + 1);
    await client.pin.update(keystore.pin, b);
    bot = await client.pin.verifyTipPin(tipPin);
    keystore.pin = tipPin;
    console.log('new keystore', keystore);
  }

  if (!bot.has_safe) {
    const seed = Buffer.from(forge.random.getBytesSync(32), 'binary');
    console.log('random seed', seed.toString('hex'));
    const resp = await client.safe.register(keystore.client_id, keystore.pin, seed);
    console.log(resp);
  }

  const members = ['7766b24c-1a03-4c3a-83a3-b4358266875d'];
  const threshold = 1;
  const recipients = [buildSafeTransactionRecipient(members, threshold, "1")];
  const ghosts = await client.utxo.ghostKey(
    recipients.map((r, i) => ({
      hint: v4(),
      receivers: r.members,
      index: i
    }))
  );
  // todo: For Mixin Kernel Address start with 'XIN'

  const outputs = await client.utxo.safeOutputs({
    members: [keystore.client_id],
    threshold: 1,
    asset: 'edb4fe8b-8f05-32e3-a0e0-5d2096e7a7ac',
    state: 'unspent',
  });
  console.log(outputs);

  const tx = buildSafeTransaction(
    outputs,
    recipients,
    ghosts,
    "test-memo", 
  );
  console.log(tx)
  const raw = encodeSafeTransaction(tx)
  console.log(raw)

  const request_id = v4();
  console.log("trace", request_id)
  const txRequest = await client.utxo.verifyTransaction([{
    raw,
    request_id
  }]);
  console.log(txRequest)
};

main();
