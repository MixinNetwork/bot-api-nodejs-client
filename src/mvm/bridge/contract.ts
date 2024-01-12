import { BigNumber, Contract, ethers, providers } from 'ethers';
import { BridgeABI } from '../abis';
import { MVMMainnet, baseGasLimit } from '../constant';

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

  vault = (address: string, amount: string) => this.contract.vault(address, amount);

  bind = (address: string) => this.contract.bind(address);

  pass = (address: string, amount: string) => this.contract.pass(address, amount);
}

export default BridgeContract;
