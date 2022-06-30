import { Contract, ethers, providers } from 'ethers';
import { AssetABI } from './abis';
import { MVMMainnet, baseGasLimit } from './constant';

class AssetContract {
  contract: Contract;

  constructor({ address, uri = MVMMainnet.RPCUri }: { address: string; uri?: string }) {
    this.contract = new ethers.Contract(address, AssetABI, new providers.StaticJsonRpcProvider(uri));
  }

  transferWithExtra = (userContract: string, value: string, extra: string, gasLimit: number = baseGasLimit) =>
    this.contract.transferWithExtra(userContract, value, extra, { gasLimit });
}

export default AssetContract;
