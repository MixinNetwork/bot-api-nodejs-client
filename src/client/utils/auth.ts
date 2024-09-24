import serialize from 'serialize-javascript';
import { ed25519 } from '@noble/curves/ed25519';
import { validate } from 'uuid';
import type { Keystore, AppKeystore, OAuthKeystore, NetworkUserKeystore } from '../types/keystore';
import { base64RawURLEncode } from './base64';
import { sha256Hash } from './uniq';
import { getKeyPair, getRandomBytes } from './ed25519';

export const getED25519KeyPair = () => getKeyPair();

export const getChallenge = () => {
  const seed = getRandomBytes(32);
  const verifier = base64RawURLEncode(seed);
  const challenge = base64RawURLEncode(sha256Hash(seed));
  return { verifier, challenge };
};

export const signToken = (payload: Object, private_key: string): string => {
  const header = base64RawURLEncode(serialize({ alg: 'EdDSA', typ: 'JWT' }));
  const payloadStr = base64RawURLEncode(serialize(payload));
  const result = [header, payloadStr];

  const signData = ed25519.sign(Buffer.from(result.join('.')), private_key);
  const sign = base64RawURLEncode(signData);
  result.push(sign);
  return result.join('.');
};

/**
 * sign an authentication token
 * sig: sha256(method + uri + params)
 */
export const signAuthenticationToken = (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: AppKeystore | NetworkUserKeystore) => {
  if (!keystore.session_id || !validate(keystore.session_id)) return '';

  let method = 'GET';
  if (methodRaw) method = methodRaw.toLocaleUpperCase();

  let data: string = '';
  if (typeof params === 'object') {
    data = serialize(params, { unsafe: true });
  } else if (typeof params === 'string') {
    data = params;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const sha256 = sha256Hash(Buffer.from(method + uri + data)).toString('hex');

  const payload = {
    uid: keystore.app_id,
    sid: keystore.session_id,
    iat,
    exp,
    jti: requestID,
    sig: sha256,
    scp: 'FULL',
  };

  return signToken(payload, keystore.session_private_key);
};

/**
 * Sign an OAuth access token
 * Notes:
 * requestID should equal the one in header
 * scope should be oauth returned
 */
export const signOauthAccessToken = (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: OAuthKeystore) => {
  if (!keystore.scope) return '';

  let method = 'GET';
  if (methodRaw) method = methodRaw.toLocaleUpperCase();

  let data: string = '';
  if (typeof params === 'object') {
    data = serialize(params, { unsafe: true });
  } else if (typeof params === 'string') {
    data = params;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const sha256 = sha256Hash(Buffer.from(method + uri + data)).toString('hex');

  const payload = {
    iss: keystore.app_id,
    aid: keystore.authorization_id,
    iat,
    exp,
    jti: requestID,
    sig: sha256,
    scp: keystore.scope,
  };

  return signToken(payload, keystore.session_private_key);
};

export const signAccessToken = (methodRaw: string | undefined, uri: string, params: Object | string, requestID: string, keystore: Keystore | undefined) => {
  if (!keystore || !keystore.app_id || !keystore.session_private_key) return '';
  if (!validate(keystore.app_id)) return '';

  const privateKey = Buffer.from(keystore.session_private_key, 'hex');
  if (privateKey.byteLength !== 32) return '';

  if ('authorization_id' in keystore) {
    return signOauthAccessToken(methodRaw, uri, params, requestID, keystore);
  }
  return signAuthenticationToken(methodRaw, uri, params, requestID, keystore);
};
