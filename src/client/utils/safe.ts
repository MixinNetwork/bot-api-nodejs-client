import { SHA3 } from 'sha3';
import forge from 'node-forge';
import { base64RawURLEncode } from './base64';
import { TIPBodyForSequencerRegister } from './tip';

export const signSafeRegistration = (user_id: string, tipPin: string, seed: Buffer) => {
  const keys = forge.pki.ed25519.generateKeyPair({ seed });
  const public_key = keys.publicKey.toString('hex');

  const hash = new SHA3(256).update(user_id).digest();
  let signData = forge.pki.ed25519.sign({
    message: hash,
    privateKey: keys.privateKey,
  });
  const signature = base64RawURLEncode(signData);

  const tipBody = TIPBodyForSequencerRegister(user_id, public_key);
  signData = forge.pki.ed25519.sign({
    message: Buffer.from(tipBody, 'hex'),
    privateKey: Buffer.from(tipPin, 'hex'),
  });

  return {
    public_key,
    signature,
    pin_base64: signData.toString('hex'),
  };
};
