import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { SnapshotResponse } from './types/snapshot';
import { WithdrawRequest } from './types/withdrawal';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

export const WithdrawalKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Submit a withdrawal request
  submit: (pin: string, params: WithdrawRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: WithdrawRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/withdrawals', request);},
});

export const WithdrawalClient = buildClient(WithdrawalKeystoreClient);

export default WithdrawalClient;