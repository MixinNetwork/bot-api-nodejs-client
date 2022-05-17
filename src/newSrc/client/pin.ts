import { AxiosInstance } from 'axios';
import { getSignPIN } from 'mixin/sign';
import { request } from 'services/request';
import { Keystore, PickFirstArg } from '../types';

// Verify or update pin, needs keystore
export const PinKeystoreClient = (keystore: Keystore, axiosInstance?: AxiosInstance) => {
  const _axiosInstance = axiosInstance || request(keystore);
  return {
    // Verify a user's PIN
    verify(pin?: string) {
      return _axiosInstance.post<unknown, void>('/pin/verify', { pin: getSignPIN(keystore, pin) });
    },
    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update(pin: string, oldPin?: string) {
      return _axiosInstance.post<unknown, void>('/pin/update', { old_pin: oldPin ? getSignPIN(keystore, oldPin) : undefined, pin: getSignPIN(keystore, pin) });
    },
  };
};

export const PinClient: PickFirstArg<typeof PinKeystoreClient> = PinKeystoreClient;
