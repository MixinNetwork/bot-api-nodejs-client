import { AxiosInstance } from 'axios';
import { Keystore } from './types/keystore';
import { SnapshotFilterRequest, SnapshotResponse } from './types/snapshot';
import { RawTransactionRequest, RawTransactionResponse } from './types/transaction';
import { TransferRequest, PaymentRequestResponse, WithdrawRequest } from './types/transfer';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

export const TransferKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Get transfer information by traceID
  show: (trace_id: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/transfers/trace/${trace_id}`),

  // Get the snapshots of the current user
  index: (snapshot_id: string, params?: SnapshotFilterRequest) => axiosInstance.get<SnapshotResponse>(`/snapshots/${snapshot_id}`, { params }),

  // Transfer to specific user
  toUser: (pin: string, params: TransferRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: TransferRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/transfers', request);
  },

  // Send raw transactions to the mainnet or multisig address
  toAddress: (pin: string, params: RawTransactionRequest): Promise<RawTransactionResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: RawTransactionRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, RawTransactionResponse>('/transactions', request);
  },

  // Generate code id for transaction/transfer or verify payments by trace id
  verify: (params: TransferRequest | RawTransactionRequest) => axiosInstance.post<unknown, PaymentRequestResponse>('/payments', params),

  // Submit a withdrawal request
  withdraw: (pin: string, params: WithdrawRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: WithdrawRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/withdrawals', request);
  }
});

export const TransferClient = buildClient(TransferKeystoreClient);

export default TransferClient;
