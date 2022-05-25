import { AxiosInstance } from 'axios';
import { Keystore } from './types/keystore';
import { SnapshotRequest, SnapshotResponse } from './types/snapshot';
import { TransferRequest, PaymentRequestResponse, WithdrawRequest } from './types/transfer';
import { GhostInput, GhostKeys, RawTransactionRequest, RawTransactionResponse } from './types/transaction';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

export const TransferKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Get transfer information by traceID
  fetch: (traceID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/transfers/trace/${traceID}`),

  // Get the snapshots of the current user
  snapshot: (snapshotID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/snapshots/${snapshotID}`),

  // Get the snapshot of a user
  snapshots: (params: SnapshotRequest): Promise<SnapshotResponse[]> => axiosInstance.get<unknown, SnapshotResponse[]>(`/snapshots`, { params }),

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
  },

  // Get one-time user keys
  outputs: (input: GhostInput): Promise<GhostKeys[]> => axiosInstance.post<unknown, GhostKeys[]>(`/outputs`, input),
});

export const TransferClient = buildClient(TransferKeystoreClient);

export default TransferClient;
