import { AxiosInstance } from 'axios';
import { Keystore } from './types/keystore';
import { SnapshotRequest, SnapshotResponse } from './types/snapshot';
import { TransferRequest } from './types/transfer';
import { GhostInputRequest, RawTransactionRequest, GhostKeysResponse } from './types/transaction';
import { signEd25519PIN } from './utils/pin';
import { buildClient } from './utils/client';

/**
 * Methods to transfer asset, withdraw and obtain transfer information
 * Note:
 * * Once /transfers API is successfully called, it means data has been confirmed by all nodes, and it is irreversible
 * Docs: https://developers.mixin.one/docs/api/transfer/transfer
 */
export const TransferKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => ({
  /** Get transfer information by traceID */
  fetch: (traceID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/transfers/trace/${traceID}`),

  /** Get specific snapshot of current user */
  snapshot: (snapshotID: string): Promise<SnapshotResponse> => axiosInstance.get<unknown, SnapshotResponse>(`/snapshots/${snapshotID}`),

  /** Get the snapshots of current user */
  snapshots: (params: SnapshotRequest): Promise<SnapshotResponse[]> => axiosInstance.get<unknown, SnapshotResponse[]>(`/snapshots`, { params }),

  /**
   * Transfer to specific user
   * If you encounter 500 error, do it over again
   * If you see the error 20119 password is wrong, do not try again. It is recommended to call the PIN Verification API to confirm
   */
  toUser: (pin: string, params: TransferRequest): Promise<SnapshotResponse> => {
    const request: TransferRequest = {
      ...params,
      pin: signEd25519PIN(pin, keystore),
    };
    return axiosInstance.post<unknown, SnapshotResponse>('/transfers', request);
  },

  /** Send raw transactions to the mainnet or multisig address */
  toAddress: (pin: string, params: RawTransactionRequest): Promise<SnapshotResponse> => {
    const request: RawTransactionRequest = {
      ...params,
      pin: signEd25519PIN(pin, keystore),
    };
    return axiosInstance.post<unknown, SnapshotResponse>('/transactions', request);
  },

  /** Get one-time user keys for mainnet */
  outputs: (input: GhostInputRequest[]): Promise<GhostKeysResponse[]> => axiosInstance.post<unknown, GhostKeysResponse[]>(`/outputs`, input),
});

export const TransferClient = buildClient(TransferKeystoreClient);

export default TransferClient;
