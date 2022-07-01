export interface ContractRequest {
  address: string;
  method: string;
  types?: string[];
  values?: any[];
}