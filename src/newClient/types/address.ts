export interface AddressResponse {
  type: 'address';
  address_id: string;
  asset_id: string;
  destination: string;
  tag: string;
  label: string;
  fee: string;
  reserve: string;
  dust: string;
  updated_at: string;
}

export interface AddressRequest {
  asset_id: string;
  label: string;
  destination: string; // alias public_key
  tag?: string; // alias memo
}