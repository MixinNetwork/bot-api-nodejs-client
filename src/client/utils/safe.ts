import { SHA3 } from 'sha3';
import forge from 'node-forge';
import { base64RawURLEncode } from './base64';
import { TIPBodyForSequencerRegister } from './tip';

export const signSafeRegistration = (tipPin: string, seed: string, user_id: string) => {
  const keys = forge.pki.ed25519.generateKeyPair({ seed });
  const public_key = keys.publicKey.toString("hex");

  const hash = new SHA3(256).update(user_id).digest('utf8');
  let signData = forge.pki.ed25519.sign({
    message: hash,
    encoding: 'utf8',
    privateKey: keys.privateKey,
  });
  const signature = base64RawURLEncode(signData);

  const tipBody = TIPBodyForSequencerRegister(user_id, public_key);
  signData = forge.pki.ed25519.sign({
    message: tipBody,
    encoding: 'utf8',
    privateKey: tipPin,
  });

  return {
    public_key,
    signature,
    pin_base64: signData.toString("hex"),
  }
}