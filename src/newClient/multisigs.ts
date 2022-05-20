import { AxiosInstance } from 'axios';
import Keystore from './types/keystore';
import { hashMember } from '../mixin/tools';
import { signEd25519PIN } from "./utils/auth";
import { buildClient } from "./utils/client";
import { MultisigRequest, MultisigIndexRequest, MultisigResponse, MultisigAction, MultisigInitAction } from './types/multisigs';

export const MutilsigsTokenClient = (axiosInstance: AxiosInstance) => ({
    // Get signature outputs, if an account participates in it
    index: (params: MultisigIndexRequest): Promise<MultisigResponse[]> => {
      const { members, threshold, order } = params;
      if ((members.length > 0 && threshold < 1) || threshold > members.length)
        return Promise.reject(new Error('Invalid threshold or members'));

      const hashedParams = {
        ...params,
        threshold: Number(threshold),
        members: hashMember(members),
        order: order || "updated",
      };
      return axiosInstance.get<unknown, MultisigResponse[]>(`/multisigs/outputs`, { params: hashedParams });
    }
  });

export const MutilsigsKeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => {

  const initMutilsig = (pin: string, request_id: string, action: MultisigAction) => {
    const encrypted = signEd25519PIN(pin, keystore);
    return axiosInstance.post(`/multisigs/requests/${request_id}/${action}`, { pin: encrypted });
  };

  return {
    // Generate a multi-signature request to obtain request_id
    create: (action: MultisigInitAction, raw: string): Promise<MultisigRequest> => axiosInstance.post(`/multisigs/requests`, { action, raw }),

    // Initiate or participate in signing
    sign: (pin: string, request_id: string) => initMutilsig(pin, request_id, "sign"),

    // Cancel multisigs
    unlock: (pin: string, request_id: string) => initMutilsig(pin, request_id, "unlock"),

    // Cancel my signature
    cancel: (pin: string, request_id: string) => initMutilsig(pin, request_id, "cancel"),
  };
};

export const MultisigsClient = buildClient({
  TokenClient: MutilsigsTokenClient,
  KeystoreClient: MutilsigsKeystoreClient
});

export default MultisigsClient;