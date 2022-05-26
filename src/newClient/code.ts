import { AxiosInstance } from 'axios';
import { CodeResponse } from './types/code';
import { buildClient } from './utils/client';

export const CodeKeystoreClient = (axiosInstance: AxiosInstance) => ({
  fetch: (consID: string): Promise<CodeResponse> => axiosInstance.get<unknown, CodeResponse>(`/codes/${consID}`),
});

export const CodeClient = buildClient(CodeKeystoreClient);

export default CodeClient;
