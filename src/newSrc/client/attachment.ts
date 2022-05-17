import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { request } from '../../services/request';
import { Attachment } from '../../types';
import { BaseClient } from '../types';

// todo move to other dir?
export async function uploadAttachmentTo(uploadURL: string, file: File): Promise<AxiosResponse> {
  return axios.create()({
    url: uploadURL,
    method: 'PUT',
    data: file,
    headers: {
      'x-amz-acl': 'public-read',
      'Content-Type': 'application/octet-stream',
    },
    maxContentLength: 2147483648,
  });
}

// todo move to other dir?
export function uploadAttachment(attachment: Attachment, file: File): Promise<AxiosResponse> {
  if (!attachment.upload_url) throw new Error('No upload URL');
  return uploadAttachmentTo(attachment.upload_url!, file);
}

export function AttachmentTokenClient(axiosInstance: AxiosInstance) {
  const createAttachment = () => axiosInstance.post<unknown, Attachment>(`/attachments`);
  return {
    createAttachment,
    showAttachment: (attachmentId: string) => axiosInstance.get<unknown, Attachment>(`/attachments/${attachmentId}`),
    uploadFile: async (file: File) => {
      const { view_url, upload_url, attachment_id } = await createAttachment();
      if (!upload_url) throw new Error('No upload URL');
      await uploadAttachmentTo(upload_url, file);
      return { view_url, attachment_id };
    },
  };
}

export const AttachmentClient: BaseClient<ReturnType<typeof AttachmentTokenClient>, ReturnType<typeof AttachmentTokenClient>> = (arg: any): any =>
  AttachmentTokenClient(request(arg));
