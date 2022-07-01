import { AxiosInstance } from 'axios';
import { CodeResponse } from './types/code';
import { buildClient } from './utils/client';

/**
 * Some information in Mixin is non-public, through codes/:id you can share it.
 * It also facilitates privacy protection
 */
export const CodeKeystoreClient = (axiosInstance: AxiosInstance) => ({
  fetch: (codeID: string): Promise<CodeResponse> => axiosInstance.get<unknown, CodeResponse>(`/codes/${codeID}`),
});

export const CodeClient = buildClient(CodeKeystoreClient);

export default CodeClient;
