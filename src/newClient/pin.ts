import { request } from 'services/request';
import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import Utils from './utils/utils';
import { buildClient } from './utils/client';

// Verify or update pin, needs keystore
export const PinKeystoreClient = (keystore: Keystore, axiosInstance?: AxiosInstance) => {
  const _axiosInstance = axiosInstance || request(keystore);

  return {
    // Verify a user's PIN
    verify(pin: string) {
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return _axiosInstance.post<void>('/pin/verify', { pin: encrypted });
    },

    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update(oldPin: string, pin: string) {
      let encryptedOldPin = '';
      if (oldPin !== '') {
        encryptedOldPin = Utils.signEd25519PIN(oldPin, keystore);
      }
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return _axiosInstance.post<void>('/pin/update', { old_pin: encryptedOldPin, pin: encrypted });
    },
  };
};

export const PinClient = buildClient({
  KeystoreClient: PinKeystoreClient,
});
