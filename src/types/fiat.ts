export interface Fiat {
  code: string
  rate: number
}

export interface FiatClientRequest {
  readFiats: () => Promise<Fiat[]>
}
