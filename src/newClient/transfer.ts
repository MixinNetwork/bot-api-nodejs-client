import { AxiosInstance } from 'axios';
import { Keystore } from './types/keystore';
import { SnapshotRequest, SnapshotResponse } from './types/snapshot';
import { TransferRequest, PaymentRequestResponse, WithdrawRequest } from './types/transfer';
import { RawTransactionRequest, GhostInput, GhostKeys } from './types/transaction';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

// Methods to transfer asset, withdraw and obtain transfer information
// Note:
// * Once /transfers API is successfully called, it means data has been confirmed by all nodes, and it is irreversible
export const TransferKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Get transfer information by traceID
  fetch: (traceID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/transfers/trace/${traceID}`),

  // Get specific snapshot of the current user
  // If it is not the transfer record of the current user, 403 will be returned, and 404 will be returned if the record is not found.
  snapshot: (snapshotID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/snapshots/${snapshotID}`),

  // Get snapshots of the current user
  snapshots: (params: SnapshotRequest): Promise<SnapshotResponse[]> => axiosInstance.get<unknown, SnapshotResponse[]>(`/snapshots`, { params }),

  // Generate code id for transaction/transfer or verify payments by trace id
  verify: (params: TransferRequest | RawTransactionRequest) => axiosInstance.post<unknown, PaymentRequestResponse>('/payments', params),

  // Transfer to specific user
  // If you encounter 500 error, do it over again
  // If you see the error 20119 password is wrong, do not try again. It is recommended to call the PIN Verification API to confirm
  toUser: (pin: string, params: TransferRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: TransferRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/transfers', request);
  },

  // Send raw transactions to the mainnet or multisig address
  toAddress: (pin: string, params: RawTransactionRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: RawTransactionRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/transactions', request);
  },

  // Submit a withdrawal request
  withdraw: (pin: string, params: WithdrawRequest): Promise<SnapshotResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    const request: WithdrawRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/withdrawals', request);
  },

  // Get one-time user keys
  outputs: (input: GhostInput): Promise<GhostKeys[]> => axiosInstance.post<unknown, GhostKeys[]>(`/outputs`, input),
});

export const TransferClient = buildClient(TransferKeystoreClient);

export default TransferClient;