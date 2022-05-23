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

export interface AddressCreateRequest {
  label: string;
  asset_id: string;
  destination: string;
  tag?: string;
  pin?: string;
}
