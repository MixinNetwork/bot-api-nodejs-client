import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { AuthenticationUserResponse } from './types/user';
import { buildClient } from './utils/client';
import { signEd25519PIN } from './utils/auth';

// Verify or update pin, needs keystore
export const PinKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  function updatePin(pin: string): Promise<AuthenticationUserResponse>;
  function updatePin(oldPin: string, pin: string): Promise<AuthenticationUserResponse>;
  function updatePin(firstPin: string, secondPin?: string): Promise<AuthenticationUserResponse> {
    const oldEncrypted = secondPin ? signEd25519PIN(firstPin, keystore) : '';
    const newEncrypted = secondPin ? signEd25519PIN(secondPin, keystore) : signEd25519PIN(firstPin, keystore);
    return axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/update', { old_pin: oldEncrypted, pin: newEncrypted });
  }

  function updatePin(pin: string): Promise<AuthenticationUserResponse>;
  function updatePin(oldPin: string, pin: string): Promise<AuthenticationUserResponse>;
  function updatePin(firstPin: string, secondPin?: string): Promise<AuthenticationUserResponse> {
    const oldEncrypted = secondPin ? signEd25519PIN(firstPin, keystore) : '';
    const newEncrypted = secondPin ? signEd25519PIN(secondPin, keystore) : signEd25519PIN(firstPin, keystore);
    return _axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/update', { old_pin: oldEncrypted, pin: newEncrypted });
  }

  return {
    // Verify a user's PIN
    verify: (pin: string) => {
      const encrypted = signEd25519PIN(pin, keystore);
      return axiosInstance.post<unknown, AuthenticationUserResponse>('/pin/verify', { pin: encrypted});
    },

    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update: updatePin
  };
};

export const PinClient = buildClient({
  KeystoreClient: PinKeystoreClient,
});

export default PinClient;
