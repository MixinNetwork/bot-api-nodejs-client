const {
  MixinApi,
  getED25519KeyPair,
  getTipPin,
  base64RawURLDecode,
  encodeSafeTransaction,
  buildSafeTransactionRecipient,
  buildSafeTransaction,
  signSafeTransaction,
} = require('..');
const forge = require('node-forge');
const { v4 } = require('uuid');
const keystore = require('../keystore.json'); // keystore from your bot

const main = async () => {
  const client = MixinApi({ keystore });
  let bot = await client.user.profile();

  // upgrade to tip pin if haven't
  // should update pin in your keystore file
  if (!bot.tip_key_base64) {
    const keys = getED25519KeyPair();
    const pub = base64RawURLDecode(keys.publicKey);
    const priv = base64RawURLDecode(keys.privateKey);
    const tipPin = priv.toString('hex');

    const b = getTipPin(pub, bot.tip_counter + 1);
    await client.pin.update(keystore.pin, b);
    bot = await client.pin.verifyTipPin(tipPin);
    keystore.pin = tipPin;
    console.log('new tip pin', tipPin);
  }

  // register to safe if haven't
  if (!bot.has_safe) {
    const seed = Buffer.from(forge.random.getBytesSync(32), 'binary');
    console.log('random seed', seed.toString('hex'));
    const resp = await client.safe.register(keystore.client_id, keystore.pin, seed);
    console.log(resp);
  }

  // destination
  const members = ['7766b24c-1a03-4c3a-83a3-b4358266875d'];
  const threshold = 1;
  const recipients = [buildSafeTransactionRecipient(members, threshold, '1')];

  // get ghost key to send tx to uuid multisigs
  const ghosts = await client.utxo.ghostKey(
    recipients.map((r, i) => ({
      hint: v4(),
      receivers: r.members,
      index: i,
    })),
  );
  ghosts[0].mask = '286d4f092015ea327ba12145edd40ddede1bdd80f777c249128d38176e352a13';
  ghosts[0].keys = ['a6c306c3137c2bf4a8bfc95ea5165f7777020916aa36ee6ec394beb9a1e6a164'];
  console.log(ghosts[0].keys);
  // For Mixin Kernel Address start with 'XIN', get ghost keys with
  //

  // get your unspent utxos
  const outputs = await client.utxo.safeOutputs({
    members: [keystore.client_id],
    threshold: 1,
    asset: 'edb4fe8b-8f05-32e3-a0e0-5d2096e7a7ac',
    state: 'unspent',
  });
  console.log(outputs);

  const tx = buildSafeTransaction(outputs, recipients, ghosts, 'test-memo');
  console.log(tx);
  const raw = encodeSafeTransaction(tx);
  console.log(raw);
  const request_id = '6a462822-036f-4c22-8971-75d37f91c7ee' // v4();
  const signedTx = await client.utxo.verifyTransaction([
    {
      raw,
      request_id,
    },
  ]);
  console.log(signedTx);
  const signedRaw = await signSafeTransaction(tx, signedTx[0].views, keystore.pin);
  console.log(signedRaw)
  const sendedTx = await client.utxo.sendTransactions([
    {
      raw: signedRaw,
      request_id,
    },
  ]);
  console.log(sendedTx)
};

main();