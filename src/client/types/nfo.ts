export interface NFOMemo {
  prefix: string;
  version: number;

  mask?: number;
  chain?: string /** chain uuid */;
  class?: string /** contract address */;
  collection?: string /** collection uuid */;
  /** Exact token ID as a decimal integer string. */
  token?: string;
  extra: string;
}
