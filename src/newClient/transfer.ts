import { AxiosInstance } from 'axios';
import { Keystore } from './types/keystore';
import { SnapshotFilterRequest, SnapshotResponse } from './types/snapshot';
import { RawTransactionRequest, RawTransactionResponse } from "./types/transaction";
import { TransferRequest, Payment, WithdrawRequest } from './types/transfer';
import Utils from "./utils/utils";
import { buildClient } from "./utils/client";

export const TransferTokenClient = (axiosInstance: AxiosInstance) => ({
  // Get transfer information by traceID
  show: (trace_id: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/transfers/trace/${trace_id}`),

  // Get the snapshots of the current user
  index: (snapshot_id: string, params?: SnapshotFilterRequest) => axiosInstance.get<SnapshotResponse>(`/snapshots/${snapshot_id}`, { params })
});

export const TransferKeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => ({
  // Transfer to specific user
  toUser: (pin: string, params: TransferRequest): Promise<SnapshotResponse> => {
    const encrypted = Utils.signEd25519PIN(pin, keystore);
    const request: TransferRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/transfers', request);
  },

  // Send raw transactions to the mainnet or multisig address
  toAddress: (pin: string, params: RawTransactionRequest): Promise<RawTransactionResponse> => {
    const encrypted = Utils.signEd25519PIN(pin, keystore);
    const request: RawTransactionRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, RawTransactionResponse>('/transactions', request);
  },

  // Generate code id for transaction/transfer or verify payments by trace id
  verify: (params: TransferRequest | RawTransactionRequest) => axiosInstance.post<unknown, Payment>('/payments', params),

  // Submit a withdrawal request
  withdraw: (pin: string, params: WithdrawRequest): Promise<SnapshotResponse> => {
    const encrypted = Utils.signEd25519PIN(pin, keystore);
    const request: WithdrawRequest = { ...params, pin: encrypted };
    return axiosInstance.post<unknown, SnapshotResponse>('/withdrawals', request);
  }
});

export const TransferClient = buildClient({
  TokenClient: TransferTokenClient,
  KeystoreClient: TransferKeystoreClient,
});

export default TransferClient;