import { ethers, Contract } from 'ethers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { RegistryABI } from './abis';

export const Blank = '0x0000000000000000000000000000000000000000';

export const MVMMainnet = {};

export const MVMTestnet = {
  ChainId: '83927',
  RPCUri: 'https://quorum-mayfly-testnet.mixin.zone',
  RPCUriAlpha: 'https://mvm-api.test.mixinbots.com',
  Registry: {
    Address: '0x535E4e8b6013f344ece46e7b0932AB617B327C39',
    PID: 'f6281e1c-53f7-3125-9cdd-30d5389189f8',
  },
  Refund: {
    Address: '0x07B0bF340765CAE77b734D82EB8d35229796CeBc',
  },
  MVMMembers: ['a15e0b6d-76ed-4443-b83f-ade9eca2681a', 'b9126674-b07d-49b6-bf4f-48d965b2242b', '15141fe4-1cfd-40f8-9819-71e453054639', '3e72ca0c-1bab-49ad-aa0a-4d8471d375e7'],
  MVMThreshold: 3,
};

// Explanation of registry contract
// https://mvm.dev/reference/registry.html
class Registry {
  contract: Contract;

  constructor(address: string=MVMTestnet.Registry.Address, uri: string=MVMTestnet.RPCUri) {
    // private key uses for fetch some public informations from mvm
    const PrivateKey = 'fd9477620edb11e46679122475d61c56d8bfb753fe68ca5565bc1f752c5f0eeb';
    const provider = (uri: string) => new StaticJsonRpcProvider(uri);
    const signer = (uri: string) => new ethers.Wallet(PrivateKey, provider(uri));

    this.contract = new ethers.Contract(
      address,
      RegistryABI.abi,
      signer(uri)
    );
  }

  // fetch a mvm address of a mixin address
  fetchAssetAddress(assetId: string) {
    const id = assetId.replaceAll('-', '');
    return this.contract.contracts(`0x${id}`);
  }

  // fetch mixin users's mvm address 
  // the address might be from a mixin multisig accounts
  // for the common mixin user, threshold is 1
  fetchUsersAddress(userIds: string[], threshold: number) {
    const bufLen = Buffer.alloc(2);
    bufLen.writeUInt16BE(userIds.length);
    const bufThres = Buffer.alloc(2);
    bufThres.writeUInt16BE(threshold);
    const ids = userIds.join('').replaceAll('-', '');
    const identity = `0x${bufLen.toString('hex')}${ids}${bufThres.toString('hex')}`;
    return this.contract.contracts(ethers.utils.keccak256(identity));
  }
}

export default Registry;
