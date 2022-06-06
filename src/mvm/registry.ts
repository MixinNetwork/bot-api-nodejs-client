import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ethers, Contract } from 'ethers';
import { RegistryABI } from './abis';
import { MVMMainnet } from './constant';

// A public Qurum secret for querying public information
const PrivateKey = 'fd9477620edb11e46679122475d61c56d8bfb753fe68ca5565bc1f752c5f0eeb';

// Explanation of registry contract
// https://mvm.dev/reference/registry.html
export class Registry {
  contract: Contract;

  constructor({ address = MVMMainnet.Registry.Address, uri = MVMMainnet.RPCUri, secret = PrivateKey }: { address?: string; uri?: string; secret?: string }) {
    // private key uses for fetch some public information from mvm
    const provider = (uri: string) => new StaticJsonRpcProvider(uri);
    const signer = (uri: string) => new ethers.Wallet(secret, provider(uri));

    this.contract = new ethers.Contract(address, RegistryABI.abi, signer(uri));
  }

  // fetch a mvm address of a mixin address
  fetchAssetAddress(assetId: string) {
    const id = assetId.replaceAll('-', '');
    return this.contract.contracts(`0x${id}`);
  }

  // fetch mixin users' mvm address
  // the address might be from a mixin multisig accounts
  // for the common mixin user, threshold is 1
  fetchUsersAddress(userIds: string[], threshold: number = 1) {
    const bufLen = Buffer.alloc(2);
    bufLen.writeUInt16BE(userIds.length);
    const bufThres = Buffer.alloc(2);
    bufThres.writeUInt16BE(threshold);
    const ids = userIds.join('').replaceAll('-', '');
    const identity = `0x${bufLen.toString('hex')}${ids}${bufThres.toString('hex')}`;
    return this.contract.contracts(ethers.utils.keccak256(identity));
  }

  // Alias method for fetchUsersAddress
  // for a single mixin user fetch mvm address
  fetchUserAddress(userId: string) {
    return this.fetchUsersAddress([userId]);
  }

  // fetch an asset of mvm address
  fetchAddressAsset(address: string) {
    return this.contract.assets(address);
  }

  // fetch the user of mvm address
  fetchAddressUsers(address: string) {
    return this.contract.users(address);
  }

  // Since extra for mtg memo is limited, it needs to
  // write a value to registry contract
  writeValue(value: string, key?: string) {
    const identity = ethers.utils.keccak256(value);
    if (key && key !== identity) {
      throw new Error('invalid key and value');
    }
    return this.contract.writeValue(identity, value);
  }
}

export default Registry;