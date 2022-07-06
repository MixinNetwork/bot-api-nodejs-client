import { BigNumber, Contract, ethers, providers } from 'ethers';
import { MVMMainnet, baseGasLimit } from 'mvm/constant';
import { BridgeABI } from 'mvm/abis';

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

  vault = (address: string, amount: string) =>
    this.contract.vault(address, amount);

  bind = (address: string) =>
    this.contract.bind(address);

  pass = (address: string, amount: string) =>
    this.contract.pass(address, amount);
}

export default BridgeContract;
