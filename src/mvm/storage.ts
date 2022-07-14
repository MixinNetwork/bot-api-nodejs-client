import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract, Wallet, utils, BigNumber } from 'ethers';
import { StorageABI } from './abis';
import { MVMMainnet } from './constant';

const PrivateKey = 'fd9477620edb11e46679122475d61c56d8bfb753fe68ca5565bc1f752c5f0eeb';

/**
 * Since extra for mtg memo is limited, it needs to write a value to storage contract.
 * It costs XIN to save a value using Storage.write(), so the wallet related to privateKey must have XIN.
 * When the length of extra is greeter than 200, you should
 * * write keccak256 hash of extra as key and extra as value to storage first
 * * then use Registry PID(without '-') + Storage Address(without '0x') + key(without '0x') as new extra
 */
export class StorageContract {
  contract: Contract;

  constructor({ address = MVMMainnet.Storage.Contract, uri = MVMMainnet.RPCUri, privateKey = PrivateKey }: { address?: string; uri?: string; privateKey?: string } = {}) {
    const provider = (uri: string) => new StaticJsonRpcProvider(uri);
    const signer = (uri: string) => new Wallet(privateKey, provider(uri));

    this.contract = new Contract(address, StorageABI, signer(uri));
  }

  /** Since extra for mtg memo is limited, it needs to write a value to registry contract */
  async writeValue(value: string, key?: string) {
    const identity = utils.keccak256(value);
    if (key && key !== identity) {
      throw new Error('invalid key and value');
    }

    const storageValue = await this.contract.read(BigNumber.from(key));
    if (storageValue === value) return {};

    return this.contract.write(BigNumber.from(identity), value);
  }

  readValue(key: string) {
    return this.contract.read(BigNumber.from(key));
  }
}

export default StorageContract;
