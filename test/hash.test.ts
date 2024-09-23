import { pki } from 'node-forge';
import { getKeyPair, getRandomBytes } from '../src';
import { ed25519 } from '@noble/curves/ed25519';

const getED25519KeyPair = (seed: Buffer) => {
  const keypair = pki.ed25519.generateKeyPair({ seed });
  return {
    privateKey: Buffer.from(keypair.privateKey),
    publicKey: Buffer.from(keypair.publicKey),
    seed,
  };
};

describe('hash', () => {
  it('ed25519', async () => {
    const nobleKeyPar = getKeyPair();
    const forgeKeyPar = getED25519KeyPair(nobleKeyPar.seed);
    expect(nobleKeyPar.privateKey.toString('hex')).toEqual(forgeKeyPar.privateKey.toString('hex'));
    expect(nobleKeyPar.publicKey.toString('hex')).toEqual(forgeKeyPar.publicKey.toString('hex'));
    expect(nobleKeyPar.seed.toString('hex')).toEqual(forgeKeyPar.seed.toString('hex'));

    const content = getRandomBytes(32);
    expect(content.byteLength).toEqual(32);
    const sigForge = pki.ed25519.sign({
      message: content.toString('base64'),
      encoding: 'utf8',
      privateKey: forgeKeyPar.privateKey,
    });
    const sig = Buffer.from(ed25519.sign(Buffer.from(content.toString('base64')), nobleKeyPar.seed));
    expect(sigForge.toString('hex')).toEqual(sig.toString('hex'));

  });
});
