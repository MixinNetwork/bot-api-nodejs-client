import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AttachmentResponse } from "./types/attachment";
import { buildClient } from "./utils/client";

// Get attachment
export const AttachmentTokenClient = (axiosInstance: AxiosInstance) => {
  return {
    // Get a specific attachment by attachmentID
    show: (attachmentId: string) => axiosInstance.get<unknown, AttachmentResponse>(`/attachments/${attachmentId}`),
  };
};

// Upload attachment
export const AttachmentKeystoreClient = (axiosInstance: AxiosInstance) => {

  const createAttachment = () => axiosInstance.post<unknown, AttachmentResponse>(`/attachments`);

  // todo move to other dir?
  const uploadAttachmentTo = (uploadURL: string, file: File): Promise<AxiosResponse> => axios.create()({
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
    // Create a new attachment before upload it
    create: createAttachment,

    // Upload a attachment
    upload: async (file: File) => {
      const { view_url, upload_url, attachment_id } = await createAttachment();
      if (!upload_url) throw new Error('No upload URL');

      await uploadAttachmentTo(upload_url, file);
      return { view_url, attachment_id };
    },
  };
};

export const AttachmentClient = buildClient({
  TokenClient: AttachmentTokenClient,
  KeystoreClient: AttachmentKeystoreClient,
});

export default AttachmentClient;