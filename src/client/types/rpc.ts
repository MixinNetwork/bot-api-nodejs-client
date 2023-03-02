import { Input, Output } from '../../mvm/types/encoder';

interface Mint {
  pool: string;
  batch: number;
  pledge: string;
}

type NodeState = 'ACCEPTED';

export interface Node {
  node: string;
  signer: string;
  payee: string;
  state: NodeState;
  timestamp: number;
  transaction: string;
  aggregator?: number;
  works?: number[];
}

interface CacheGraph {
  node: string;
  reference: {
    external: string;
    self: string;
  };
  round: number;
  snapshot: [];
  timestamp: number;
}

interface FinalGraph {
  hash: string;
  node: string;
  round: number;
  start: number;
  end: number;
}

interface Gragh {
  consensus: Node[];
  cache: {
    [key: string]: CacheGraph
  },
  final: {
    [key: string]: FinalGraph
  },
  sps: number;
  topology: number;
  tps: number;
}

export interface GraphHead {
  node: string;
  round: number;
  hash: string;
  pool: {
    count: number;
    index: number;
  }
}

interface Queue {
  finals: number;
  caches: number;
  state: {
    [key: string]: number[];
  }
}

interface MetricCount {
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

interface Metric {
  transport: {
    received: MetricCount;
    sent: MetricCount;
  }
}

export interface NodeInfoResponse {
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

export interface TransactionResponse {
  hash?: string;
  snapshot?: string;
  signatures?: {
    [key: number]: string;
  };
  aggregated?: {
    signers: number[];
    signature: string;
  };

  version?: number;
  asset: string;
  inputs?: Input[];
  outputs?: Output[];
  extra: string;
}

export interface UTXORpcResponse {
  amount: string;
  hash: string;
  index: number;
  keys: string[];
  lock: string;
  mask: string;
  script: string;
  type: string;
}

export interface KeyRpcResponse {
  transaction: string;
}

export interface SnapshotRpcResponse {
  hash?: string;
  hex?: string;
  node?: string;
  references?: References | null;
  round: number;
  signature: string | null;
  timestamp: number;
  topology: number;
  transaction: TransactionResponse | string;
  transactions?: TransactionResponse[];
  version?: number;
  witness: {
    signature: string;
    timestamp: number;
  }
}

export interface MintWork{
  [key: string]: number[];
}

export interface MintDistribution {
  amount: string;
  batch: number;
  group: string;
  transaction: TransactionResponse | string;
}

interface References {
  external: string;
  self: string;
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

export interface SendRawTransactionResponse {
  hash: string;
}