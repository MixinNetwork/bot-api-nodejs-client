
interface Address {
  address_id: string
  asset_id: string
  label: string
  destination: string
  tag: string
  fee: number
  dust: number
}

interface AddressCreateParams {
  asset_id: string
  destination: string
  tag?: string
  label?: string
}