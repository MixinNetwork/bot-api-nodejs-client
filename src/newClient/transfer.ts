import { AxiosInstance } from 'axios';
import { Keystore } from './types/keystore';
import { SnapshotRequest, SnapshotResponse } from './types/snapshot';
import { TransferRequest, PaymentRequestResponse } from './types/transfer';
import { RawTransactionRequest, GhostInput, GhostKeys } from './types/transaction';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';

export const TransferKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  // Get transfer information by traceID
  fetch: (traceID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/transfers/trace/${traceID}`),

  // Get specific snapshot of current user
  snapshot: (snapshotID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/snapshots/${snapshotID}`),

  // Get the snapshots of current user
  snapshots: (params: SnapshotRequest): Promise<SnapshotResponse[]> => axiosInstance.get<unknown, SnapshotResponse[]>(`/snapshots`, { params }),

  // Generate code id for transaction/transfer or verify payments by trace id
  verify: (params: TransferRequest | RawTransactionRequest) => axiosInstance.post<unknown, PaymentRequestResponse>('/payments', params),

  // Transfer to specific user
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

  // Get one-time user keys for mainnet
  outputs: (input: GhostInput): Promise<GhostKeys[]> => axiosInstance.post<unknown, GhostKeys[]>(`/outputs`, input),
});

export const TransferClient = buildClient(TransferKeystoreClient);

export default TransferClient;