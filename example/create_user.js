const { MixinApi, getED25519KeyPair, base64RawURLEncode, base64RawURLDecode, getTipPinUpdateMsg } = require('..');
const keystore = require('../keystore.json');

const main = async () => {
  const client = MixinApi({ keystore });

  const { seed: sessionSeed, publicKey: sessionPublicKey } = getED25519KeyPair();
  const session_private_key = sessionSeed.toString('hex');
  console.log('user session_private_key', session_private_key);
  const user = await client.user.createBareUser('test-user', base64RawURLEncode(sessionPublicKey));
  console.log('user_id', user.user_id);
  console.log('user_session_id', user.session_id);

  const userClient = MixinApi({
    keystore: {
      app_id: user.user_id,
      session_id: user.session_id,
      pin_token_base64: user.pin_token_base64,
      session_private_key,
    },
  });

  const { privateKey: spendPrivateKey, publicKey: spendPublicKey } = getED25519KeyPair();
  const spend_private_key = spendPrivateKey.toString('hex');
  console.log('user spend_private_key', spend_private_key);
  await userClient.pin.updateTipPin('', spendPublicKey.toString('hex'), user.tip_counter + 1);
  console.log('tip pin updated');
  await userClient.pin.verifyTipPin(spendPrivateKey);
  console.log('tip pin verified');

  const account = await userClient.safe.register(user.user_id, spend_private_key, spendPrivateKey);
  console.log(`account: ${account.user_id} has_safe: ${account.has_safe}`);
};

main();
