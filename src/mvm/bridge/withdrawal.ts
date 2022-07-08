import { BigNumber, Contract, ethers, providers } from 'ethers';
import { baseGasLimit, MVMMainnet } from '../constant';
import { WithdrawalABI } from '../abis';

class WithdrawalContract {
  contract: Contract;

  constructor({
    address = MVMMainnet.Withdrawal.Contract,
    uri = MVMMainnet.RPCUri,
  }: {
    address?: string;
    uri?: string;
  } = {}) {
    this.contract = new ethers.Contract(address, WithdrawalABI, new providers.StaticJsonRpcProvider(uri));
  }

  submit = (
    receiver: string,
    asset: string,
    amount: string,
    feeAsset: string,
    feeAmount: string,
    ma: string,
    mb: string,
    value: BigNumber,
    gasLimit: number = baseGasLimit
  ) => this.contract.submit(receiver, asset, amount, feeAsset, feeAmount, ma, mb, {
    gasLimit,
    value,
  });
}

export default WithdrawalContract;
