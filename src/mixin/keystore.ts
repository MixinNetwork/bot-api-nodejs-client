import { sign } from 'jsonwebtoken';
import { v4 } from 'uuid';
import { getEd25519Sign, toBuffer } from './sign';
import { Keystore } from '../types';

export class KeystoreAuth {
  keystore?: Keystore;

  constructor(keystore?: Keystore) {
    this.keystore = keystore;
  }

  signToken(signature: string, requestID: string): string {
    const { user_id: client_id, session_id, private_key, scope } = this.keystore!;
    const issuedAt = Math.floor(Date.now() / 1000);
    if (!requestID) requestID = v4();
    const payload = {
      uid: client_id,
      sid: session_id,
      iat: issuedAt,
      exp: issuedAt + 3600,
      jti: requestID,
      sig: signature,
      scp: scope || 'FULL',
    };
    const _privateKey = toBuffer(private_key, 'base64');
    return _privateKey.length === 64 ? getEd25519Sign(payload, _privateKey) : sign(payload, private_key, { algorithm: 'RS512' });
  }
}
