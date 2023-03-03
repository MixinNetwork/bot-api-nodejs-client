import axios, { type AxiosResponse } from 'axios';
import type { 
  NodeInfoRpcResponse, 
  SyncPoint, 
  SendRawTransactionRpcResponse, 
  TransactionRpcResponse, 
  UTXORpcResponse, 
  KeyRpcResponse,
  SnapshotRpcResponse,
  MintWorkRpcResponse,
  MintDistributionRpcResponse,
  NodeRpcResponse,
  RoundRpcResponse,
  RoundLinkRpcResponse
} from './types';

axios.defaults.headers.post['Content-Type'] = 'application/json';

export const MixinMainnetRPC = "https://rpc.mixin.dev";

export const RpcClient = () => {
  const ins = axios.create({
    baseURL: MixinMainnetRPC,
    timeout: 1000 * 10
  });

  ins.interceptors.response.use(async (res: AxiosResponse) => {
    const { data } = res.data;
    return data;
  });
  
  return {
    getInfo: (): Promise<NodeInfoRpcResponse> => ins.post<unknown, NodeInfoRpcResponse>('/', { method: 'getinfo', params: [] }),

    dumpGraphHead: (): Promise<SyncPoint[]> => ins.post<unknown, SyncPoint[]>('/', { method: 'dumpgraphhead', params: [] }),

    sendRawTransaction: (raw: string): Promise<SendRawTransactionRpcResponse> => ins.post<unknown, SendRawTransactionRpcResponse>('/', { method: 'sendrawtransaction', params: [ raw ] }),

    getTransaction: (hash: string): Promise<TransactionRpcResponse> => ins.post<unknown, TransactionRpcResponse>('/', { method: 'gettransaction', params: [ hash ] }),

    getCacheTransaction: (hash: string): Promise<TransactionRpcResponse> => ins.post<unknown, TransactionRpcResponse>('/', { method: 'getcachetransaction', params: [ hash ] }),

    getUTXO: (hash: string, index: string): Promise<UTXORpcResponse> => ins.post<unknown, UTXORpcResponse>('/', { method: 'getutxo', params: [ hash, index ] }),

    getKey: (key: string): Promise<KeyRpcResponse> => ins.post<unknown, KeyRpcResponse>('/', { method: 'getkey', params: [ key ] }),

    getSnapshot: (hash: string): Promise<SnapshotRpcResponse> => ins.post<unknown, SnapshotRpcResponse>('/', { method: 'getsnapshot', params: [ hash ] }),

    listSnapshots: (offset: string, count: string, sig: boolean, tx: boolean): Promise<SnapshotRpcResponse[]> => 
      ins.post<unknown, SnapshotRpcResponse[]>('/', { method: 'listsnapshots', params: [ offset, count, sig, tx ] }),

    listMintWorks: (offset: string): Promise<MintWorkRpcResponse[]> => ins.post<unknown, MintWorkRpcResponse[]>('/', { method: 'listmintworks', params: [ offset ] }),

    listMintDistributions: (offset: string, count: string, tx: boolean): Promise<MintDistributionRpcResponse[]> => 
      ins.post<unknown, MintDistributionRpcResponse[]>('/', { method: 'listmintdistributions', params: [ offset, count, tx ] }),

    listAllNodes: (threshold: string, state?: boolean): Promise<NodeRpcResponse[]> => ins.post<unknown, NodeRpcResponse[]>('/', { method: 'listallnodes', params: [ threshold, state ] }),

    getRoundByNumber: (node: string, number: string): Promise<RoundRpcResponse> => ins.post<unknown, RoundRpcResponse>('/', { method: 'getroundbynumber', params: [ node, number ] }),

    getRoundByHash: (hash: string): Promise<RoundRpcResponse> => ins.post<unknown, RoundRpcResponse>('/', { method: 'getroundbyhash', params: [ hash ] }),

    getRoundLink: (from: string, to: string): Promise<RoundLinkRpcResponse> => ins.post<unknown, RoundLinkRpcResponse>('/', { method: 'getroundlink', params: [ from, to ] }),
  }
}

export default RpcClient;