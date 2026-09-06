import { ed25519 } from '@noble/curves/ed25519.js';
import serialize from 'serialize-javascript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppKeystore, Keystore, OAuthKeystore } from '../../src/client/types';
import { getChallenge, signAccessToken, signToken } from '../../src/client/utils/auth';
import { base64RawURLDecode } from '../../src/client/utils/base64';
import { sha256Hash } from '../../src/client/utils/uniq';

const privateKey = '01'.repeat(32);
const appID = '4b79fe76-0d9d-49e6-85fd-0f6be01147da';
const sessionID = 'a03a4496-3e59-4abd-bd1e-1ab8a2acb550';
const requestID = '772e6bef-3bff-4fcc-987d-29bafca74d63';

const decodePart = (value: string) => JSON.parse(base64RawURLDecode(value).toString());

describe('authentication utilities', () => {
  afterEach(() => vi.useRealTimers());

  it('creates a verifiable EdDSA token', () => {
    const token = signToken({ subject: 'test' }, privateKey);
    const [header, payload, signature] = token.split('.');

    expect(decodePart(header)).toEqual({ alg: 'EdDSA', typ: 'JWT' });
    expect(decodePart(payload)).toEqual({ subject: 'test' });
    expect(ed25519.verify(base64RawURLDecode(signature), Buffer.from(`${header}.${payload}`), ed25519.getPublicKey(Buffer.from(privateKey, 'hex')))).toBe(true);
  });

  it('signs application requests with normalized method, body hash, and timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T03:04:05Z'));
    const keystore: AppKeystore = {
      app_id: appID,
      session_id: sessionID,
      session_private_key: privateKey,
      server_public_key: '02'.repeat(32),
    };
    const body = { value: '<script>' };

    const [, payloadPart] = signAccessToken('post', '/resource', body, requestID, keystore).split('.');
    const payload = decodePart(payloadPart);

    expect(payload).toMatchObject({
      uid: appID,
      sid: sessionID,
      iat: 1767323045,
      exp: 1767326645,
      jti: requestID,
      scp: 'FULL',
      sig: sha256Hash(Buffer.from(`POST/resource${serialize(body, { unsafe: true })}`)).toString('hex'),
    });
  });

  it('signs OAuth requests with authorization and scope claims', () => {
    const keystore: OAuthKeystore = {
      app_id: appID,
      authorization_id: sessionID,
      scope: 'PROFILE:READ',
      session_private_key: privateKey,
    };

    const [, payloadPart] = signAccessToken(undefined, '/me', '', requestID, keystore).split('.');

    expect(decodePart(payloadPart)).toMatchObject({
      iss: appID,
      aid: sessionID,
      jti: requestID,
      scp: 'PROFILE:READ',
      sig: sha256Hash(Buffer.from('GET/me')).toString('hex'),
    });
  });

  it.each([
    undefined,
    {},
    { app_id: 'invalid', session_private_key: privateKey },
    { app_id: appID, session_private_key: '01' },
    { app_id: appID, session_id: 'invalid', session_private_key: privateKey, server_public_key: '02'.repeat(32) },
    { app_id: appID, authorization_id: sessionID, scope: '', session_private_key: privateKey },
  ])('returns an empty token for incomplete or invalid credentials', keystore => {
    expect(signAccessToken('GET', '/me', '', requestID, keystore as Keystore | undefined)).toBe('');
  });

  it('creates a PKCE verifier and its SHA-256 challenge', () => {
    const { verifier, challenge } = getChallenge();
    const seed = base64RawURLDecode(verifier);

    expect(seed).toHaveLength(32);
    expect(challenge).toBe(sha256Hash(seed).toString('base64url'));
  });
});
