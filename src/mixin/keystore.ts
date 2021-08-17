import { sign } from 'jsonwebtoken'
import { getEd25519Sign, toBuffer } from './sign'

export class KeystoreAuth {
  keystore?: Keystore

  constructor(keystore?: Keystore) {
    this.keystore = keystore
  }

  signToken(signatrue: string, requestID: string): string {
    const { client_id, session_id, private_key, scope } = this.keystore!
    let issuedAt = Math.floor(Date.now() / 1000)
    let payload = {
      uid: client_id,
      sid: session_id,
      iat: issuedAt,
      exp: issuedAt + 3600,
      jti: requestID,
      sig: signatrue,
      scp: scope || 'FULL',
    }
    let _privateKey = toBuffer(private_key, 'base64')
    return _privateKey.length === 64 ? getEd25519Sign(payload, _privateKey) : sign(payload, private_key, { algorithm: 'RS512' })
  }
}