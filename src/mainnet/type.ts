import { Input, Output } from '../mvm/types/encoder';

type NodeState = 'PLEDGING' | 'ACCEPTED' | 'REMOVED' | 'CANCELLED';

type References = null | {
  external: string;
  self: string;
};

export interface NodeInfoRpcResponse {
  network: string;
  node: string;
  version: string;
  uptime: string;
  epoch: string;
  timestamp: string;

  mint?: Mint;
  graph?: Gragh;
  queue?: Queue;
  metric?: Metric;
}

export interface SyncPoint {
  node: string;
  round: number;
  hash: string;
  pool: {
    count: number;
    index: number;
  };
}

export interface SendRawTransactionRpcResponse {
  hash: string;
}

export interface TransactionRpcResponse {
  version: number;
  asset: string;
  inputs: Input[];
  outputs: Output[];
  extra: string;
  hash: string;
  hex: string;
  snapshot?: string;
}

export interface UTXORpcResponse {
  type: string;
  hash: string;
  index: number;
  amount: string;

  keys?: string[];
  script?: string;
  mask?: string;
  lock?: string;
}

export interface KeyRpcResponse {
  transaction: string;
}

export interface SnapshotRpcResponse {
  version: number;
  node: string;
  references: References;
  round: number;
  timestamp: number;
  hash: string;
  hex?: string;
  topology?: number;
  witness?: {
    signature: string;
    timestamp: number;
  };

  transaction: TransactionRpcResponse | string;
  transactions?: TransactionRpcResponse[] | string[];

  signature?: string;
  signatures?: string[];
}

export interface MintWorkRpcResponse {
  [key: string]: number[];
}

export interface MintDistributionRpcResponse {
  batch: number;
  group: string;
  amount: string;
  transaction: TransactionRpcResponse | string;
}

export interface NodeRpcResponse {
  id: string;
  payee: string;
  signer: string;
  state: NodeState;
  timestamp: number;
  transaction: string;
}

export interface RoundRpcResponse {
  node: string;
  hash: string;
  start: number;
  end: number;
  number: number;
  references: References;
  snapshots: SnapshotRpcResponse[];
}

export interface RoundLinkRpcResponse {
  link: number;
}

interface Mint {
  pool: string;
  batch: number;
  pledge: string;
}

interface Gragh {
  /** node state is 'PLEDGING' | 'ACCEPTED' */
  consensus: Node[];
  cache: {
    [key: string]: CacheGraph;
  };
  final: {
    [key: string]: FinalGraph;
  };
  sps: number;
  topology: number;
  tps: number;
}

interface CacheGraph {
  node: string;
  round: number;
  timestamp: number;
  snapshots: SnapshotRpcResponse[];
  references: References;
}

interface FinalGraph {
  hash: string;
  node: string;
  round: number;
  start: number;
  end: number;
}

interface Queue {
  finals: number;
  caches: number;
  /** key is chain id */
  state: {
    [key: string]: number[];
  };
}

interface Metric {
  transport: {
    received: MetricPool;
    sent: MetricPool;
  };
}

interface MetricPool {
  ping: number;
  authentication: number;
  graph: number;
  'snapshot-confirm': number;
  'transaction-request': number;
  transaction: number;

  'snapshot-announcement': number;
  'snapshot-commitment': number;
  'transaciton-challenge': number;
  'snapshot-response': number;
  'snapshot-finalization': number;
  commitments: number;
  'full-challenge': number;

  bundle: number;
  'gossip-neighbors': number;
}
