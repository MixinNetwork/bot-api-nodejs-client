import axios, { AxiosInstance } from 'axios';
import { AttachmentResponse } from './types/attachment';
import { buildClient } from './utils/client';

export const AttachmentKeystoreClient = (axiosInstance: AxiosInstance) => {
  const createAttachment = (): Promise<AttachmentResponse> => axiosInstance.post<unknown, AttachmentResponse>(`/attachments`);

  const uploadAttachmentTo = (uploadURL: string, file: File): Promise<any> =>
    axios.create()({
      url: uploadURL,
      method: 'PUT',
      data: file,
      headers: {
        'x-amz-acl': 'public-read',
        'Content-Type': 'application/octet-stream',
      },
      maxContentLength: 2147483648,
    });

  return {
    /** Get a specific attachment by attachmentID */
    fetch: (attachmentID: string): Promise<AttachmentResponse> => axiosInstance.get<unknown, AttachmentResponse>(`/attachments/${attachmentID}`),

    /** Create a new attachment before upload it */
    create: createAttachment,

    /** Upload a attachment */
    upload: async (file: File) => {
      const { view_url, upload_url, attachment_id } = await createAttachment();
      if (!upload_url) throw new Error('No upload URL');

      await uploadAttachmentTo(upload_url, file);
      return { view_url, attachment_id };
    },
  };
};

export const AttachmentClient = buildClient(AttachmentKeystoreClient);

export default AttachmentClient;
