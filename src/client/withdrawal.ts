import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { SnapshotResponse } from './types/snapshot';
import { WithdrawalRequest } from './types/withdrawal';
import { signEd25519PIN } from './utils/pin';
import { buildClient } from './utils/client';

/**
 * User need to create an address before withdrawal
 * If the address belongs to a Mixin user, withdrawal will not charge any fee
 * Docs: https://developers.mixin.one/docs/api/withdrawal/withdrawal
 */
export const WithdrawalKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  /** Submit a withdrawal request */
  submit: (pin: string, params: WithdrawalRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, SnapshotResponse>('/withdrawals', { ...params, pin: encrypted });
  },
});

export const WithdrawalClient = buildClient(WithdrawalKeystoreClient);

export default WithdrawalClient;
