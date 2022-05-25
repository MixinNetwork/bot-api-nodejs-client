import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { MultisigRequest, MultisigRequestResponse, MultisigUTXOResponse, MultisigAction, MultisigInitAction } from './types/multisig';
import { signEd25519PIN } from './utils/auth';
import { buildClient } from './utils/client';
import { hashMembers } from './utils/uniq';

export const MultisigKeystoreClient = (axiosInstance: AxiosInstance, keystore: Keystore | undefined) => {
  const initMultisig = (pin: string, requestID: string, action: MultisigAction): Promise<MultisigRequestResponse> => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post<unknown, MultisigRequestResponse>(`/multisigs/requests/${requestID}/${action}`, { pin: encrypted });
  };

  return {
    // Get signature outputs, if an account participates in it
    outputs: (params: MultisigRequest): Promise<MultisigUTXOResponse[]> => {
      const { members, threshold } = params;
      if (members.length === 0 || threshold < 1 || threshold > members.length)
        return Promise.reject(new Error('Invalid threshold or members'));

      const hashedParams = {
        ...params,
        members: hashMembers(members),
      };
      return axiosInstance.get<unknown, MultisigUTXOResponse[]>(`/multisigs/outputs`, { params: hashedParams });
    },

    // Generate a multi-signature request to obtain request_id
    create: (action: MultisigInitAction, raw: string): Promise<MultisigRequestResponse> => axiosInstance.post<unknown, MultisigRequestResponse>(`/multisigs/requests`, { action, raw }),

    // Initiate or participate in signing
    sign: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMultisig(pin, requestID, 'sign'),

    // Cancel multisigs
    unlock: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMultisig(pin, requestID, 'unlock'),

    // Cancel my signature
    cancel: (pin: string, requestID: string): Promise<MultisigRequestResponse> => initMultisig(pin, requestID, 'cancel'),
  };
};

export const MultisigClient = buildClient(MultisigKeystoreClient);

export default MultisigClient;
