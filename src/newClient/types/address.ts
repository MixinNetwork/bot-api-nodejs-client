export interface AddressResponse {
    type?: 'address';
    address_id: string;
    asset_id: string;
    destination: string;
    tag: string;
    label: string;
    fee: string;
    dust: string;
}

export interface AddressCreateRequest {
    label: string;
    asset_id: string;
    destination: string;
    tag?: string;
    pin?: string;
}
