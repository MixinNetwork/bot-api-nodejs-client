import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { MultisigIndexRequest, MultisigRequestResponse, MultisigUTXOResponse, MultisigAction, MultisigInitAction } from './types/multisigs';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';
import { hashMembers } from './utils/uniq';

export const MutilsigsKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  const initMutilsig = (pin: string, requestID: string, action: MultisigAction): Promise<MultisigRequestResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, MultisigRequestResponse>(`/multisigs/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Get signature outputs, if an account participates in it
    outputs: (params: MultisigIndexRequest): Promise<MultisigUTXOResponse[]> => {
      const { members, threshold, order } = params;
      if ((members.length > 0 && threshold < 1) || threshold > members.length)
        return Promise.reject(new Error('Invalid threshold or members'));

      const hashedParams = {
        ...params,
        threshold: Number(threshold),
        members: hashMembers(members),
        order: order || 'updated',
      };
      return axiosInstance.get<unknown, MultisigUTXOResponse[]>(`/multisigs/outputs`, { params: hashedParams });
    },

    // Generate a multi-signature request to obtain request_id
    create: (action: MultisigInitAction, raw: string): Promise<MultisigRequestResponse> => axiosInstance.post<unknown, MultisigRequestResponse>(`/multisigs/requests`, { action, raw }),

    // Initiate or participate in signing
    sign: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMutilsig(pin, requestID, 'sign'),

    // Cancel multisigs
    unlock: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMutilsig(pin, requestID, 'unlock'),

    // Cancel my signature
    cancel: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMutilsig(pin, requestID, 'cancel'),
  };
};

export const MultisigsClient = buildClient(MutilsigsKeystoreClient);

export default MultisigsClient;