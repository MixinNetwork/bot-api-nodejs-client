import axios, { type AxiosResponse } from 'axios';
import type { 
  NodeInfoResponse, 
  GraphHead, 
  SendRawTransactionResponse, 
  TransactionResponse, 
  UTXORpcResponse, 
  KeyRpcResponse,
  SnapshotRpcResponse,
  MintWork,
  MintDistribution,
  Node,
  RoundRpcResponse,
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
    getInfo: (): Promise<NodeInfoResponse> => ins.post<unknown, NodeInfoResponse>('/', { method: 'getinfo', params: [] }),

    dumpGraphHead: (): Promise<GraphHead[]> => ins.post<unknown, GraphHead[]>('/', { method: 'dumpgraphhead', params: [] }),

    sendRawTransaction: (raw: string): Promise<SendRawTransactionResponse> => ins.post<unknown, SendRawTransactionResponse>('/', { method: 'sendrawtransaction', params: [ raw ] }),

    getTransaction: (hash: string): Promise<TransactionResponse> => ins.post<unknown, TransactionResponse>('/', { method: 'gettransaction', params: [ hash ] }),

    getCacheTransaction: (hash: string): Promise<TransactionResponse> => ins.post<unknown, TransactionResponse>('/', { method: 'getcachetransaction', params: [ hash ] }),

    getUTXO: (hash: string, index: string): Promise<UTXORpcResponse> => ins.post<unknown, UTXORpcResponse>('/', { method: 'getutxo', params: [ hash, index ] }),

    getKey: (key: string): Promise<KeyRpcResponse> => ins.post<unknown, KeyRpcResponse>('/', { method: 'getkey', params: [ key ] }),

    getSnapshot: (hash: string): Promise<SnapshotRpcResponse> => ins.post<unknown, SnapshotRpcResponse>('/', { method: 'getsnapshot', params: [ hash ] }),

    listSnapshots: (offset: string, count: string, sig: boolean, tx: boolean): Promise<SnapshotRpcResponse[]> => 
      ins.post<unknown, SnapshotRpcResponse[]>('/', { method: 'listsnapshots', params: [ offset, count, sig, tx ] }),

    listMintWorks: (offset: string): Promise<MintWork[]> => ins.post<unknown, MintWork[]>('/', { method: 'listmintworks', params: [ offset ] }),

    listMintDistributions: (offset: string, count: string, tx: boolean): Promise<MintDistribution[]> => 
      ins.post<unknown, MintDistribution[]>('/', { method: 'listmintdistributions', params: [ offset, count, tx ] }),

    listAllNodes: (threshold: string, state?: boolean): Promise<Node[]> => ins.post<unknown, Node[]>('/', { method: 'listallnodes', params: [ threshold, state ] }),

    getRoundByNumber: (node: string, number: string): Promise<RoundRpcResponse> => ins.post<unknown, RoundRpcResponse>('/', { method: 'getroundbynumber', params: [ node, number ] }),

    getRoundByHash: (hash: string): Promise<RoundRpcResponse> => ins.post<unknown, RoundRpcResponse>('/', { method: 'getroundbyhash', params: [ hash ] }),

    getRoundLink: (from: string, to: string) => ins.post('/', { method: 'getroundlink', params: [ from, to ] }),

  }
}

export default RpcClient;