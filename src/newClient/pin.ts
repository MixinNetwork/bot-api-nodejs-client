import { AxiosInstance } from 'axios';
import { http } from './http';
import Keystore from './types/keystore';
import Utils from './utils/utils';
import { buildClient } from './utils/client';
import { UserResponse } from "./types/user";

// Verify or update pin, needs keystore
export const PinKeystoreClient = (keystore: Keystore, axiosInstance?: AxiosInstance) => {
  const _axiosInstance = axiosInstance || http(keystore);

  function updatePin(pin: string): Promise<UserResponse>;
  function updatePin(oldPin: string, pin: string): Promise<UserResponse>;
  function updatePin(firstPin: string, secondPin?: string): Promise<UserResponse> {
    const oldEncrypted = secondPin ? Utils.signEd25519PIN(firstPin, keystore) : '';
    const newEncrypted = secondPin ? Utils.signEd25519PIN(secondPin, keystore) : Utils.signEd25519PIN(firstPin, keystore);
    return _axiosInstance.post<unknown, UserResponse>('/pin/update', { old_pin: oldEncrypted, pin: newEncrypted });
  }

  return {
    // Verify a user's PIN
    verify: (pin: string) => {
      const encrypted = Utils.signEd25519PIN(pin, keystore);
      return _axiosInstance.post<unknown, any>('/pin/verify', { pin: encrypted });
    },

    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update: updatePin
  };
};

export const PinClient = buildClient({
  KeystoreClient: PinKeystoreClient,
});

export default PinClient;