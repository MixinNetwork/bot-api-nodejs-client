const { Wallet, ethers } = require('ethers');
const { StaticJsonRpcProvider } = require('@ethersproject/providers');
const { v4 } = require('uuid');
const { MVMMainnet, BridgeABI, AssetABI, MVMApiURI, MixinAssetID, MVMApi, BridgeApi, MixinApi, Registry, getExtra, encodeMemo } = require('..');

const mode = 'contract';
const withdrawAsset = MixinAssetID; // asset_id of ETH
const amount = '0.001';
const destination = ''; // withdrawal address, it's free to withdraw to mixin address
const tag = ''; // used when withdraw to chain like EOS, which needs memo

const privateKey = ''; // private key of wallet
const provider = new StaticJsonRpcProvider(MVMMainnet.RPCUri);
const signer = new Wallet(privateKey, provider);

// withdraw by calling contracts
const main = async () => {
  // Get the Mixin User bound to an address
  const bridgeClient = BridgeApi();
  const user = await bridgeClient.register({
    public_key: await signer.getAddress(),
  });

  // Get withdrawal fee
  const mixinClient = MixinApi({
    keystore: {
      ...user,
      ...user.key,
    },
  });
  const { fee } = await mixinClient.external.checkAddress({
    destination,
    asset: withdrawAsset,
  });
  console.log(`withdraw fee is ${fee}`);
  const asset = await mixinClient.asset.fetch(withdrawAsset);

  console.log('generate extras...');
  const traceId = v4();
  // Generate extra for withdraw asset
  const assetExtra = await bridgeClient.generateExtra({
    destination,
    tag,
    extra: `${traceId}:A`,
  });
  // Generate extra for withdraw fee
  const feeExtra = await bridgeClient.generateExtra({
    destination,
    tag,
    extra: `${traceId}:B`,
  });

  if (mode === 'contract') {
    // withdraw by calling the according contract directly
    await contractWithdrawal(user, asset, fee, assetExtra, feeExtra);
  } else {
    // withdraw by calling the according contract through Registry
    await registryWithdrawal(user, asset, fee, assetExtra, feeExtra);
  }
};

const contractWithdrawal = async (user, asset, fee, assetExtra, feeExtra) => {
  const bridge = new ethers.Contract('0x0915EaE769D68128EEd9711A0bc4097831BE57F3', BridgeABI, signer);

  console.log('withdraw...');
  if (withdrawAsset === MixinAssetID) {
    await bridge.release(user.contract, assetExtra, {
      gasPrice: 10000000, // 0.01 Gwei
      gasLimit: 350000,
      value: ethers.utils.parseEther(Number(amount).toFixed(8)),
    });

    await bridge.release(user.contract, feeExtra, {
      gasPrice: 10000000, // 0.01 Gwei
      gasLimit: 350000,
      value: ethers.utils.parseEther(Number(fee).toFixed(8)),
    });

    return;
  }

  if (asset.chain_id === withdrawAsset && asset.contract) {
    const tokenContract = new ethers.Contract(asset.contract, AssetABI, signer);
    const tokenDecimal = await tokenContract.decimals();
    const value = ethers.utils.parseUnits(amount, tokenDecimal);

    await tokenContract.transferWithExtra(user.contract, value, assetExtra, {
      gasPrice: 10000000,
      gasLimit: 350000,
    });
    await bridge.release(user.contract, assetExtra, {
      gasPrice: 10000000, // 0.01 Gwei
      gasLimit: 350000,
      value: ethers.utils.parseEther(Number(amount).toFixed(8)),
    });
  }
};

const registryWithdrawal = async (user, asset, fee, assetExtra, feeExtra) => {
  const mvmClient = MVMApi(MVMApiURI);
  const registry = new Registry();
  const withdrawalAsset = await registry.fetchAssetContract(asset.asset_id);
  const withdrawalFeeAsset = asset.asset_id === asset.chain_id ? withdrawalAsset : await registry.fetchAssetContract(asset.asset_id);

  console.log('withdraw...');
  const assetContractExtra = getExtra([
    {
      address: withdrawalAsset,
      method: 'transferWithExtra',
      types: ['address', 'uint256', 'bytes'],
      values: [user.contract, ethers.utils.parseUnits(amount, 8), assetExtra],
    },
  ]);
  const assetTx = {
    asset_id: withdrawAsset,
    amount,
    trace_id: v4(),
    memo: encodeMemo(assetContractExtra, MVMMainnet.Registry.PID),
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    },
  };
  const assetPayment = await mvmClient.payments(assetTx);
  console.log(`mixin://codes/${assetPayment.code_id}`);

  fee = Number(fee) === 0 ? '0.00000001' : fee;
  const feeContractExtra = getExtra([
    {
      address: withdrawalFeeAsset,
      method: 'transferWithExtra',
      types: ['address', 'uint256', 'bytes'],
      values: [user.contract, ethers.utils.parseUnits(fee, 8), feeExtra],
    },
  ]);
  const feeTx = {
    asset_id: withdrawAsset,
    amount: fee,
    trace_id: v4(),
    memo: encodeMemo(feeContractExtra, MVMMainnet.Registry.PID),
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    },
  };
  const feePayment = await mvmClient.payments(feeTx);
  console.log(`mixin://codes/${feePayment.code_id}`);
};

main();
