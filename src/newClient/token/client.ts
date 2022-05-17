import { AxiosInstance } from 'axios';
import { AddressClient } from './address';
import { AppClient } from './app';
import { AssetClient } from './asset';
import { AttachmentClient } from './attachment';
import { ConversationClient } from './conversation';
import { User } from './user';

export const TokenClient = (axiosInstance: AxiosInstance) => {
  return {
    ...AddressClient(axiosInstance),
    ...AppClient(axiosInstance),
    ...AssetClient(axiosInstance),
    ...AttachmentClient(axiosInstance),
    ...ConversationClient(axiosInstance),
    user: User(axiosInstance),
  };
};
