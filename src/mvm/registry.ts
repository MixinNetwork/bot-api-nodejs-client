import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ethers, Contract, BigNumber } from 'ethers';
import { stringify as uuidStringify } from 'uuid';
import { RegistryABI } from './abis';
import { MVMMainnet } from './constant';
import { RegistryUserResponse } from './types/registry';

// A public Qurum secret for querying public information
const PrivateKey = 'fd9477620edb11e46679122475d61c56d8bfb753fe68ca5565bc1f752c5f0eeb';

/**
 * Explanation of registry contract
 * https://mvm.dev/reference/registry.html
 */
export class Registry {
  contract: Contract;

  constructor({
    address = MVMMainnet.Registry.Contract,
    uri = MVMMainnet.RPCUri,
    secret = PrivateKey,
  }: {
    address?: string;
    uri?: string;
    secret?: string;
  } = {}) {
    // private key uses for fetch some public information from mvm
    const provider = (uri: string) => new StaticJsonRpcProvider(uri);
    const signer = (uri: string) => new ethers.Wallet(secret, provider(uri));

    this.contract = new ethers.Contract(address, RegistryABI, signer(uri));
  }

  /** fetch a mvm address of a mixin address */
  fetchAssetContract(assetId: string) {
    const id = assetId.replaceAll('-', '');
    return this.contract.contracts(`0x${id}`);
  }

  /**
   * fetch mixin users' mvm address
   * the address might be from a mixin multisig accounts
   * for the common mixin user, threshold is 1
   */
  fetchUsersContract(userIds: string[], threshold: number = 1) {
    const bufLen = Buffer.alloc(2);
    bufLen.writeUInt16BE(userIds.length);
    const bufThres = Buffer.alloc(2);
    bufThres.writeUInt16BE(threshold);
    const ids = userIds.sort().join('').replaceAll('-', '');
    const identity = `0x${bufLen.toString('hex')}${ids}${bufThres.toString('hex')}`;
    return this.contract.contracts(ethers.utils.keccak256(identity));
  }

  /**
   * Alias method for fetchUsersContract
   * for a single mixin user fetch mvm address
   */
  fetchUserContract(userId: string) {
    return this.fetchUsersContract([userId]);
  }

  /** fetch an asset of mvm address */
  async fetchContractAsset(address: string) {
    return this.contract.assets(address).then((data: BigNumber) => uuidStringify(Buffer.from(data.toHexString().slice(2), 'hex')));
  }

  /** fetch the user of mvm address */
  fetchContractUsers(address: string) {
    return this.contract.users(address).then((data: string): RegistryUserResponse => {
      const usersBuf = Buffer.from(data.slice(2), 'hex');
      const users: string[] = [];
      for (let i = 2; i < usersBuf.length - 2; i += 16) {
        users.push(uuidStringify(usersBuf.slice(i, i + 16)));
      }

      const threshold = usersBuf.readUInt16BE(usersBuf.length - 2);
      return {
        users,
        threshold,
      };
    });
  }
}

export default Registry;
