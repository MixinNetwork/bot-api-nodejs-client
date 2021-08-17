
interface Keystore {
  client_id: string
  client_secret: string
  session_id: string
  private_key: string
  pin_token: string
  scope?: string
  pin: string
}


interface ErrorResponse {
  status: number
  code: number
  description: string
  extra?: object
  request_id?: string
}

