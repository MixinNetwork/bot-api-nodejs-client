import { Input, Output } from './encoder';

export interface Transaction {
  hash?: string;
  snapshot?: string;
  signatures?: {
    [key: number]: string;
  };
  aggregated?: {
    signers: number[];
    signature: string;
  };

  version?: number;
  asset: string;
  inputs?: Input[];
  outputs?: Output[];
  extra: string;
}
