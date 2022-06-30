import { BigNumber, Contract, ethers, providers } from 'ethers';
import { BridgeABI } from 'mvm/abis';
import { MVMMainnet } from 'mvm/constant';
import { baseGasLimit } from '../../constant';

class BridgeContract {
  contract: Contract;

  constructor({
    address = MVMMainnet.Bridge.Contract,
    uri = MVMMainnet.RPCUri,
  }: {
    address?: string;
    uri?: string;
  } = {}) {
    this.contract = new ethers.Contract(address, BridgeABI, new providers.StaticJsonRpcProvider(uri));
  }

  release = (userContract: string, extra: string, value: BigNumber, gasLimit: number = baseGasLimit) =>
    this.contract.release(userContract, extra, {
      gasLimit,
      value,
    });
}

export default BridgeContract;
