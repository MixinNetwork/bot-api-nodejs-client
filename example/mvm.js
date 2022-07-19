const { v4 } = require('uuid');
const { MixinApi, MVMMainnet, Registry, StorageContract, getExtra, getExtraWithStorageKey, encodeMemo } = require('@mixin.dev/mixin-node-sdk');
const { keccak256 } = require('ethers/lib/utils');
const keystore = require('../keystore.json');

keystore.user_id = keystore.client_id;
const mixinClient = MixinApi({
  requestConfig: {
    responseCallback: err => {
      console.log(err);
    },
  },
  keystore,
});

const registry = new Registry({
  address: MVMMainnet.Registry.Contract,
  uri: MVMMainnet.RPCUri,
});
const storage = new StorageContract();

async function main() {
  const contractReadCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'count', // contract function
  };
  const contractAddAnyCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'addAny', // contract function
    types: ['uint256'], // function parameters type array
    values: [2], // function parameters value array
  };
  const contractAddOneCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'addOne', // contract function
  };
  // contracts array to call
  const contracts = [contractReadCount, contractAddOneCount, contractReadCount];

  // 1 build extra for contracts
  const extra = getExtra(contracts);
  console.log(extra.length);
  let finalExtra = extra;

  // 2 if extra.length > 200
  //   write keccak256 hash of extra as key to Storage contract，
  //   then build a new extra with key
  if (extra.length > 200) {
    const key = keccak256(finalExtra);
    const { error } = storage.writeValue(finalExtra, key);
    if (error) throw new Error(error);

    finalExtra = getExtraWithStorageKey(key, MVMMainnet.Registry.PID, MVMMainnet.Storage.Contract);

    // The original extra is stored in Storage Contract
    const storageValue = await storage.readValue(key);
    console.log(storageValue === extra);
  }

  // 3 build request to generate payment
  const transactionInput = {
    // '965e5c6e-434c-3fa9-b780-c50f43cd955c', CNB asset_id
    // 'c94ac88f-4671-3976-b60a-09064f1811e8', XIN asset_id
    asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
    amount: '0.00000001',
    trace_id: v4(),
    memo: encodeMemo(finalExtra, MVMMainnet.Registry.PID),
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    },
  };

  // 4 Send transaction
  const way = 'transaction';
  if (way === 'code_id') {
    // You can Request a code_id, and pay in mixin messenger with code_id
    const res = await mixinClient.payment.request(transactionInput);
    console.log(`mixin://codes/${res.code_id}`);
  } else {
    // Or you can pay with the bot according to keystore, your bot must have the enough asset to pay
    const res = await mixinClient.transfer.toAddress(keystore.pin, transactionInput);
    console.log(res);
  }

  // Fetch asset's asset_id using its contract address
  const cnbAssetID = await registry.fetchContractAsset('0x910Fb1751B946C7D691905349eC5dD250EFBF40a'); // cnb 的地址
  console.log(cnbAssetID._hex);

  // Fetch asset's contract address using its asset_id
  const btcAssetContract = await registry.fetchAssetContract('c6d0c728-2624-429b-8e0d-d9d19b6592fa');
  console.log(btcAssetContract);

  // Fetch user's corresponding contract address using its client_id
  const userAddress = await registry.fetchUserContract('2fd00f14-ed87-4aaf-ab91-e37659a65a25');
  console.log(userAddress);
}

main();
