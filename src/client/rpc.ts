import axios, { type AxiosResponse } from 'axios';
import axiosRetry, { isIdempotentRequestError } from 'axios-retry';
import isRetryAllowed from 'is-retry-allowed';
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
    const { data, error } = res.data;
    if (error) throw new Error(error);
    return data;
  }, async (e: any) => Promise.reject(e));
   
  axiosRetry(ins, {
    retries: 5,
    shouldResetTimeout: true,
    retryDelay: () => 500,
    retryCondition: error =>
      (
        !error.response &&
        Boolean(error.code) && // Prevents retrying cancelled requests
        isRetryAllowed(error)
      ) || isIdempotentRequestError(error)
  });

  return {
    getInfo: (id = '1'): Promise<NodeInfoRpcResponse> => ins.post<unknown, NodeInfoRpcResponse>('/', { id, method: 'getinfo', params: [] }),

    dumpGraphHead: (id = '1'): Promise<SyncPoint[]> => ins.post<unknown, SyncPoint[]>('/', { id, method: 'dumpgraphhead', params: [] }),

    sendRawTransaction: (raw: string, id = '1'): Promise<SendRawTransactionRpcResponse> => ins.post<unknown, SendRawTransactionRpcResponse>('/', { id, method: 'sendrawtransaction', params: [ raw ] }),

    getTransaction: (hash: string, id = '1'): Promise<TransactionRpcResponse> => ins.post<unknown, TransactionRpcResponse>('/', { id, method: 'gettransaction', params: [ hash ] }),

    getCacheTransaction: (hash: string, id = '1'): Promise<TransactionRpcResponse> => ins.post<unknown, TransactionRpcResponse>('/', { id, method: 'getcachetransaction', params: [ hash ] }),

    getUTXO: (hash: string, index: string, id = '1'): Promise<UTXORpcResponse> => ins.post<unknown, UTXORpcResponse>('/', { id, method: 'getutxo', params: [ hash, index ] }),

    getKey: (key: string, id = '1'): Promise<KeyRpcResponse> => ins.post<unknown, KeyRpcResponse>('/', { id, method: 'getkey', params: [ key ] }),

    getSnapshot: (hash: string, id = '1'): Promise<SnapshotRpcResponse> => ins.post<unknown, SnapshotRpcResponse>('/', { id, method: 'getsnapshot', params: [ hash ] }),

    listSnapshots: (offset: string, count: string, sig: boolean, tx: boolean, id = '1'): Promise<SnapshotRpcResponse[]> => 
      ins.post<unknown, SnapshotRpcResponse[]>('/', { id, method: 'listsnapshots', params: [ offset, count, sig, tx ] }),

    listMintWorks: (offset: string, id = '1'): Promise<MintWorkRpcResponse[]> => ins.post<unknown, MintWorkRpcResponse[]>('/', { id, method: 'listmintworks', params: [ offset ] }),

    listMintDistributions: (offset: string, count: string, tx: boolean, id = '1'): Promise<MintDistributionRpcResponse[]> => 
      ins.post<unknown, MintDistributionRpcResponse[]>('/', { id, method: 'listmintdistributions', params: [ offset, count, tx ] }),

    listAllNodes: (threshold: string, state?: boolean, id = '1'): Promise<NodeRpcResponse[]> => ins.post<unknown, NodeRpcResponse[]>('/', { id, method: 'listallnodes', params: [ threshold, state ] }),

    getRoundByNumber: (node: string, number: string, id = '1'): Promise<RoundRpcResponse> => ins.post<unknown, RoundRpcResponse>('/', { id, method: 'getroundbynumber', params: [ node, number ] }),

    getRoundByHash: (hash: string, id = '1'): Promise<RoundRpcResponse> => ins.post<unknown, RoundRpcResponse>('/', { id, method: 'getroundbyhash', params: [ hash ] }),

    getRoundLink: (from: string, to: string, id = '1'): Promise<RoundLinkRpcResponse> => ins.post<unknown, RoundLinkRpcResponse>('/', { id, method: 'getroundlink', params: [ from, to ] }),
  }
}

export default RpcClient;