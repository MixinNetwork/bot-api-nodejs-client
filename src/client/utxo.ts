import { AxiosInstance } from 'axios';
import { buildClient } from './utils/client';
import { UtxoOutput, OutputRequest } from './types/utxo';
import { hashMembers } from './utils';

export const UtxoKeystoreClient = (axiosInstance: AxiosInstance) => ({
  outputs: (params: OutputRequest): Promise<UtxoOutput[]> =>
    axiosInstance.get<unknown, UtxoOutput[]>(`/outputs`, {
      params: {
        ...params,
        members: hashMembers(params.members),
      },
    }),
});

export const UtxoClient = buildClient(UtxoKeystoreClient);

export default UtxoClient;
