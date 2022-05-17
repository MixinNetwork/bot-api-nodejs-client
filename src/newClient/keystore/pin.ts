import { AxiosInstance } from 'axios';
import { getSignPIN } from '../../mixin/sign';
import { Keystore } from '../../types';
import { request } from "../../services/request";

// Verify or update pin, needs keystore
export function Pin(keystore: Keystore, axiosInstance?: AxiosInstance) {
  const _axiosInstance = axiosInstance || request(keystore);
  return {
    // Verify a user's PIN
    verify(pin?: string) {
      pin = getSignPIN(keystore, pin);
      return _axiosInstance.post<unknown, void>('/pin/verify', { pin });
    },
    // Change the PIN of the user, or setup a new PIN if it is not set yet
    update(pin: string, old_pin?: string) {
      pin = getSignPIN(keystore, pin);
      if (old_pin) old_pin = getSignPIN(keystore, old_pin);
      return _axiosInstance.post<unknown, void>('/pin/update', { old_pin, pin });
    }
  };
}
