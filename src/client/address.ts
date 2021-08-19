import { Keystore, Address, AddressCreateParams, AddressClientRequest } from '../types'
import { AxiosInstance } from 'axios'
import { getSignPIN } from '../mixin/sign'

export class AddressClient implements AddressClientRequest {
  request!: AxiosInstance
  keystore!: Keystore
  createAddress(params: AddressCreateParams, pin?: string): Promise<Address> {
    if (pin) params.pin = pin
    else if (this.keystore.pin) params.pin = this.keystore.pin
    if (!params.pin) return Promise.reject(new Error('No pin provided'))
    params.pin = getSignPIN(this.keystore, params.pin)
    return this.request.post('/addresses', params)
  }
  readAddress(addressID: string): Promise<Address> {
    return this.request.get(`/addresses/${addressID}`)
  }
  readAddresses(assetID: string): Promise<Address[]> {
    return this.request.get(`/assets/${assetID}/addresses`)
  }
  deleteAddress(addressID: string, pin?: string): Promise<void> {
    if (!pin) pin = this.keystore.pin
    if (!pin) return Promise.reject(new Error('No pin provided'))
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/addresses/${addressID}/delete`, { pin })
  }
}
