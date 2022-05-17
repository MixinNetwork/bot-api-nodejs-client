import Keystore from './types/keystore';
import { PickFirstArg } from './types/client';
import HTTP from './http';
import Utils from './utils/utils';

// Verify or update pin, needs keystore
export const PinKeystoreClient = (keystore: Keystore) => {
  const http = new HTTP(keystore);

  return {
    // Verify a user's PIN
    verify(pin: string) {
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return http.request('POST', '/pin/verify', { pin: encrypted });
    },

    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update(oldPin: string, pin: string) {
      let encryptedOldPin = '';
      if (oldPin !== '') {
        encryptedOldPin = Utils.signEd25519PIN(oldPin, keystore); 
      }
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return http.request('POST', '/pin/update', { old_pin: encryptedOldPin, pin: encrypted });
    },
  };
};

export const PinClient: PickFirstArg<typeof PinKeystoreClient> = PinKeystoreClient;
