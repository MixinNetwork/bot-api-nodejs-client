import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { MultisigAction, MultisigInitAction, MultisigRequest, MultisigUtxoResponse, MultisigRequestResponse, SafeMultisigsResponse, TransactionRequest } from './types';
import { signEd25519PIN } from './utils/pin';
import { hashMembers } from './utils/uniq';
import { buildClient } from './utils/client';

/**
 * Users can use those APIs to manage their multisig outputs
 * Note:
 * * Before transferring tokens, user should create a request first.
 * * only unsigned request can be canceled.
 * * only uncompleted sign transaction can be unlocked.
 * Docs: https://developers.mixin.one/docs/api/multisigs/request
 */
export const MultisigKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  const initMultisig = (pin: string, requestID: string, action: MultisigAction): Promise<MultisigRequestResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, MultisigRequestResponse>(`/multisigs/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    /** Get signature outputs, if an account participates in it */
    outputs: (params: MultisigRequest): Promise<MultisigUtxoResponse[]> => {
      const { members, threshold } = params;
      if (members.length === 0 || threshold < 1 || threshold > members.length) return Promise.reject(new Error('Invalid threshold or members'));

      const hashedParams = {
        ...params,
        members: hashMembers(members),
      };
      return axiosInstance.get<unknown, MultisigUtxoResponse[]>(`/multisigs/outputs`, { params: hashedParams });
    },

    /** Generate a multi-signature request to obtain request_id */
    create: (action: MultisigInitAction, raw: string): Promise<MultisigRequestResponse> =>
      axiosInstance.post<unknown, MultisigRequestResponse>(`/multisigs/requests`, { action, raw }),

    /** Initiate or participate in signing */
    sign: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMultisig(pin, requestID, 'sign'),

    /** Cancel my signature before the multisig finish */
    unlock: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMultisig(pin, requestID, 'unlock'),

    /** Cancel my multisig request */
    cancel: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMultisig(pin, requestID, 'cancel'),

    createSafeMultisigs: (params: TransactionRequest[]): Promise<SafeMultisigsResponse[]> => axiosInstance.post<unknown, SafeMultisigsResponse[]>('/safe/multisigs', params),

    fetchSafeMultisigs: (id: string): Promise<SafeMultisigsResponse> => axiosInstance.get<unknown, SafeMultisigsResponse>(`/safe/multisigs/${id}`),

    signSafeMultisigs: (id: string, raw: string): Promise<SafeMultisigsResponse> => axiosInstance.post<unknown, SafeMultisigsResponse>(`/safe/multisigs/${id}/sign`, { raw }),

    unlockSafeMultisigs: (id: string): Promise<SafeMultisigsResponse> => axiosInstance.post<unknown, SafeMultisigsResponse>(`/safe/multisigs/${id}/unlock`),
  };
};

export const MultisigClient = buildClient(MultisigKeystoreClient);

export default MultisigClient;
