export interface NFOMemo {
  prefix: string;
  version: number;

  mask?: number;
  chain?: string /** chain uuid */;
  class?: string /** contract address */;
  collection?: string /** collection uuid */;
  token?: number;
  extra: string;
}
