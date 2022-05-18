import { AxiosInstance } from 'axios';
import { http } from './http';
import Keystore from './types/keystore';
import Utils from './utils/utils';
import { buildClient } from './utils/client';

// Verify or update pin, needs keystore
export const PinKeystoreClient = (keystore: Keystore, axiosInstance?: AxiosInstance) => {
  const _axiosInstance = axiosInstance || http(keystore);

  return {
    // Verify a user's PIN
    verify: (pin: string) => {
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return _axiosInstance.post<void>('/pin/verify', { pin: encrypted });
    },

    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update: (pin: string, oldPin?: string) => {
      const encryptedOldPin = oldPin ? Utils.signEd25519PIN(oldPin, keystore) : '';
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return _axiosInstance.post<void>('/pin/update', { old_pin: encryptedOldPin, pin: encrypted });
    },
  };
};

export const PinClient = buildClient({
  KeystoreClient: PinKeystoreClient,
});
