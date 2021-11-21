import { AxiosInstance } from 'axios';
import { request } from '../services/request';
import { Fiat, FiatClientRequest } from '../types/fiat';

export class FiatClient implements FiatClientRequest {
  request!: AxiosInstance;
  readFiats(): Promise<Fiat[]> {
    return this.request.get(`/fiats`);
  }
}
export const readFiats = (token: string): Promise<Fiat[]> =>
  request(undefined, token).get(`/fiats`);
