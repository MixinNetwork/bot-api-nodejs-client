import serialize from 'serialize-javascript';
import forge from 'node-forge';
import { v4 as uuid } from 'uuid';
import Keystore from '../types/keystore';
import { base64RawURLDecode, base64RawURLEncode } from './base64';

export const getED25519KeyPair = () => {
  const keypair = forge.pki.ed25519.generateKeyPair();
  return {
    privateKey: base64RawURLEncode(keypair.privateKey),
    publicKey: base64RawURLEncode(keypair.publicKey),
  };
};

const signToken = (payload: Object, private_key: string): string => {
  const header = base64RawURLEncode(serialize({ alg: 'EdDSA', typ: 'JWT' }));
  const payloadStr = base64RawURLEncode(serialize(payload));

  const privateKey = base64RawURLDecode(private_key);
  const result = [header, payloadStr];
  const signData = forge.pki.ed25519.sign({
    message: result.join('.'),
    encoding: 'utf8',
    privateKey,
  });

  const sign = base64RawURLEncode(signData);
  result.push(sign);
  return result.join('.');
};

// sign an authentication token
// sig: sha256(method + uri + params)
export const signAuthenticationToken = (methodRaw: string | undefined, uri: string, params: Object | string, keystore: Keystore) => {
  const method = methodRaw!.toLocaleUpperCase() || 'GET';
  let data: string = '';
  if (typeof params === 'object') {
    data = serialize(params, {unsafe: true});
  } else if (typeof params === 'string') {
    data = params;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const md = forge.md.sha256.create();
  md.update(method + uri + data, 'utf8');

  const payload = {
    uid: keystore.user_id,
    sid: keystore.session_id,
    iat,
    exp,
    jti: uuid(),
    sig: md.digest().toHex(),
    scp: keystore.scope || 'FULL',
  };

  return signToken(payload, keystore.private_key!);
};

// Sign an OAuth access token
// Notes:
// requestID should equal the one in header
// scope should be oauth returned
export const signOauthAccessToken = (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: Keystore) => {
  const method = methodRaw!.toLocaleUpperCase() || 'GET';
  let data: string = '';
  if (typeof params === 'object') {
    data = serialize(params, {unsafe: true});
  } else if (typeof params === 'string') {
    data = params;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const md = forge.md.sha256.create();
  md.update(method + uri + data, 'utf8');

  const payload = {
    iss: keystore.user_id,
    aid: keystore.authorization_id,
    iat,
    exp,
    jti: requestID,
    sig: md.digest().toHex(),
    scp: keystore.scope,
  };

  return signToken(payload, keystore.private_key!);
};

export const signAccessToken = (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: Keystore | undefined) => {
  if (!keystore) {
    return '';
  }

  if (keystore.authorization_id) {
    return signOauthAccessToken(methodRaw, uri, params, requestID, keystore);
  }
  return signAuthenticationToken(methodRaw, uri, params, keystore);
};