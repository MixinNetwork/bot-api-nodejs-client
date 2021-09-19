export interface CollectiblesUTXO {

}


export interface CollectiblesRequest {

}


export interface CollectiblesAction {
}



export interface CollectiblesClientRequest {
  readCollectible(offset: string, limit: number): Promise<CollectiblesUTXO[]>
  readCollectibleOutputs(members: string[], threshold: number, offset: string, limit: number): Promise<CollectiblesUTXO[]>
  createCollectible(action: string, raw: string): Promise<CollectiblesRequest>
  signCollectible(request_id: string, pin: string): Promise<CollectiblesRequest>
  cancelCollectible(request_id: string): Promise<void>
  unlockCollectible(request_id: string, pin: string): Promise<void>
}