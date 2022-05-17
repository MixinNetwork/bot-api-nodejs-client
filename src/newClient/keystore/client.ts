import { AxiosInstance } from 'axios';
import { Keystore } from 'types';
import { AddressClient } from './address';
import { ConversationClient } from './conversation';
import { Pin } from "./pin";

export const KeystoreClient = (keystore: Keystore, axiosInstance: AxiosInstance) => {
  return {
    ...AddressClient(keystore, axiosInstance),
    ...ConversationClient(keystore, axiosInstance),
    pin: Pin(keystore, axiosInstance),
  };
};
