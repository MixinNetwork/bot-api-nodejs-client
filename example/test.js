import { Wallet, ethers } from 'ethers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { v4 } from 'uuid';
import { MVMMainnet, BridgeABI, BridgeApi, MixinApi, AssetABI } from '@mixin.dev/mixin-node-sdk';

const bridgeClient = BridgeApi();
const mixinClient = MixinApi({});

const assetId = '43d61dcd-e413-450d-80b8-101d5e903357'; // ETH
const destination = ''; // 提现地址
const tag = '';
const amount = '0.1';
const asset = await mixinClient.network.fetchAsset(assetId);

const publicKey = ''; // 钱包地址
const privateKey = ''; // 钱包私钥
const provider = new StaticJsonRpcProvider(MVMMainnet.RPCUri);
const signer = new Wallet(privateKey, provider);
const bridge = new ethers.Contract(
  '0x0915EaE769D68128EEd9711A0bc4097831BE57F3', // Bridge 合约地址
  BridgeABI,
  signer,
);
// 钱包地址对应的 Mixin User 所绑定的 MVM Contract 地址
const { contract } = await bridgeClient.register({
  public_key: publicKey,
});

const main = async () => {
  const traceId = v4();
  const action1 = {
    destination,
    tag,
    extra: `${traceId}:A`,
  };
  const action2 = {
    destination,
    tag,
    extra: `${traceId}:B`,
  };
  const extra1 = await bridgeClient.generateExtra(action1);
  const extra2 = await bridgeClient.generateExtra(action2);

  // 提现 ETH
  const assetRes1 = await bridge.release(contract, extra1, {
    gasPrice: 10000000, // 0.01 Gwei
    gasLimit: 350000,
    value: ethers.utils.parseEther(Number(amount).toFixed(8)),
  });

  // 提现 ERC20
  const tokenContract = new ethers.Contract(asset.contract, AssetABI, signer);
  const tokenDecimal = await tokenContract.decimals();
  const value = ethers.utils.parseUnits(amount, tokenDecimal);
  await tokenContract.transferWithExtra(contract, value, extra2, {
    gasPrice: 10000000,
    gasLimit: 350000,
  });

  // 提现费用
  const feeRes = await bridge.release(contract, extra2, {
    gasPrice: 10000000, // 0.01 Gwei
    gasLimit: 350000,
    value: ethers.utils.parseEther(Number(asset.fee).toFixed(8)),
  });
};
