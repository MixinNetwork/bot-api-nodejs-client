


interface Turn {
  url: string
  username: string
  credential: string
}

export interface PinClientRequest {
  VerifyPin(pin: string): Promise<void>
  ModifyPin(pin: string, newPin: string): Promise<void>
  ReadTurnServers(): Promise<Turn[]>
}