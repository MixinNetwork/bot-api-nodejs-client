import { pki, util, cipher, md } from 'node-forge';
import { ed25519 } from '@noble/curves/ed25519';
import { cbc } from '@noble/ciphers/aes';
import { Uint64LE as Uint64 } from 'int64-buffer';
import { v4, stringify } from 'uuid';
import { getKeyPair, getRandomBytes, sharedEd25519Key, getNanoTime, sha256Hash, uniqueConversationID } from '../src';
import { app_pin } from './common';
import keystore from './keystore';

const getED25519KeyPair = (seed: Buffer) => {
  const keypair = pki.ed25519.generateKeyPair({ seed });
  return {
    privateKey: Buffer.from(keypair.privateKey),
    publicKey: Buffer.from(keypair.publicKey),
    seed,
  };
};

const forgeUniqueConversationID = (userID: string, recipientID: string): string => {
  const [minId, maxId] = [userID, recipientID].sort();
  const md5 = md.md5.create();
  md5.update(minId);
  md5.update(maxId);
  const bytes = Buffer.from(md5.digest().bytes(), 'binary');

  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return stringify(bytes);
};

describe('forge', () => {
  it('sign', async () => {
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

  it('cipher', async () => {
    const _pin = Buffer.from(app_pin, 'hex');
    const iterator = Buffer.from(new Uint64(getNanoTime()).toBuffer());
    const time = Buffer.from(new Uint64(Date.now() / 1000).toBuffer());
    let buffer = Buffer.concat([_pin, time, iterator]);

    const iv = getRandomBytes(16);
    const sharedKey = sharedEd25519Key(keystore);

    const cp = cipher.createCipher('AES-CBC', util.createBuffer(sharedKey, 'raw'));
    cp.start({ iv: iv.toString('binary') });
    cp.update(util.createBuffer(buffer));
    cp.finish();
    const resForge = cp.output.getBytes();

    const stream = cbc(sharedKey, iv);
    const resNoble = Buffer.from(stream.encrypt(buffer));
    expect(resNoble.toString('binary')).toEqual(resForge);
  });

  it('md5', async () => {
    const id1 = v4();
    const id2 = v4();

    const resForge = forgeUniqueConversationID(id1, id2);
    const res = uniqueConversationID(id1, id2);
    expect(res).toEqual(resForge);
  });

  it('sha256', async () => {
    const id = v4();

    const sha256 = md.sha256.create();
    sha256.update(id, 'utf8');
    const resForge = sha256.digest().toHex();

    const res = sha256Hash(Buffer.from(id)).toString('hex');
    expect(res).toEqual(resForge);
  });
});
