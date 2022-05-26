import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { SnapshotResponse } from './types/snapshot';
import { WithdrawalRequest } from './types/withdrawal';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

// It costs fee to withdrawal. To get the fee, use GET /assets/{asset_id}/fee
export const WithdrawalKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Submit a withdrawal request
  submit: (pin: string, params: WithdrawalRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, SnapshotResponse>('/withdrawals', { ...params, pin: encrypted });
  },
});

export const WithdrawalClient = buildClient(WithdrawalKeystoreClient);

export default WithdrawalClient;