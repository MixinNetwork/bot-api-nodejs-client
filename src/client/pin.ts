import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AuthenticationUserResponse } from './types/user';
import { buildClient } from './utils/client';
import { signTipBody, getNanoTime, getTipPinUpdateMsg, getVerifyPinTipBody, signEd25519PIN } from './utils/pin';

/**
 * Methods to verify or update pin with keystore
 * Note:
 * * If you forget your PIN, there is no way to retrieve or restore it
 * Docs: https://developers.mixin.one/docs/api/pin/pin-update
 */
export const PinKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  function updatePin(firstPin: string, secondPin = ''): Promise<AuthenticationUserResponse> {
    const oldEncrypted = firstPin ? signEd25519PIN(firstPin, keystore) : '';
    const newEncrypted = signEd25519PIN(secondPin, keystore);
    return axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/update', { old_pin_base64: oldEncrypted, pin_base64: newEncrypted });
  }

  function updateTipPin(firstPin: string, secondPin: string, counter: number): Promise<AuthenticationUserResponse> {
    const pubTipBuf = Buffer.from(secondPin, 'hex');
    if (pubTipBuf.byteLength !== 32) throw new Error('invalid public key');
    const pubTipHex = getTipPinUpdateMsg(pubTipBuf, counter).toString('hex');

    const oldEncrypted = firstPin ? signEd25519PIN(firstPin, keystore) : '';
    const newEncrypted = signEd25519PIN(pubTipHex, keystore);
    return axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/update', { old_pin_base64: oldEncrypted, pin_base64: newEncrypted });
  }

  return {
    /** Verify a user's PIN, the iterator of the pin will increment also */
    verify: (pin: string) => {
      const encrypted = signEd25519PIN(pin, keystore);
      return axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/verify', { pin: encrypted });
    },

    verifyTipPin: (pin: string) => {
      const timestamp = getNanoTime();
      const msg = getVerifyPinTipBody(timestamp);
      const signedTipPin = signTipBody(pin, msg);
      return axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/verify', {
        pin_base64: signEd25519PIN(signedTipPin, keystore),
        timestamp,
      });
    },

    /** Change the PIN of the user, or setup a new PIN if it is not set yet */
    update: updatePin,

    updateTipPin,
  };
};

export const PinClient = buildClient(PinKeystoreClient);

export default PinClient;
