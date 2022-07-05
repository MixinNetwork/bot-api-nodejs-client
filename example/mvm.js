const { v4 } = require('uuid');
const {
  MixinApi,
  MVMMainnet,
  Registry,
  StorageContract,
  getExtra,
  getExtraWithStorageKey,
} = require('@mixin.dev/mixin-node-sdk');
const { keccak256 } = require('ethers/lib/utils');
const keystore = require('../keystore.json');

keystore.user_id = keystore.client_id;

const mixinClient = MixinApi({ keystore });
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
  const contracts = [
    contractReadCount,
    contractAddOneCount,
    contractReadCount,
    contractAddAnyCount,
    contractReadCount,
  ];

  // 1 build extra for contracts
  const extra = getExtra(contracts);
  let finalExtra = extra;
  console.log(extra, extra.length);
  const key = keccak256(finalExtra);

  // 2 if extra.length > 200
  //   write keccak256 hash of extra as key to Storage contract，
  //   then build a new extra with key
  if (extra.length > 200) {
    const { error } = storage.writeValue(finalExtra, key);
    if (error) throw new Error(error);

    finalExtra = getExtraWithStorageKey(key);
  }

  // 3 build request to generate payment
  const transactionInput = {
    // '965e5c6e-434c-3fa9-b780-c50f43cd955c' cnb asset_id
    asset_id: 'c94ac88f-4671-3976-b60a-09064f1811e8', // XIN asset_id
    amount: '0.00000001',
    trace_id: v4(),
    memo: finalExtra,
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    },
  };

  // 3. Request a code_id，then post /transaction to pay
  const res = await mixinClient.payment.request(transactionInput);
  // Or you can use mixin address to pay in Mixin Messenger
  console.log(`mixin://codes/${res.code_id}`);

  // The original extra is stored in Storage Contract
  const storageValue = await storage.readValue(key);
  console.log(storageValue === extra);

  // Fetch asset's asset_id using its contract address
  const cnbAssetID = await registry.fetchContractAsset(
    '0x910Fb1751B946C7D691905349eC5dD250EFBF40a'
  ); // cnb 的地址
  console.log(cnbAssetID._hex);

  // Fetch asset's contract address using its asset_id
  const btcAssetContract = await registry.fetchAssetContract(
    'c6d0c728-2624-429b-8e0d-d9d19b6592fa'
  );
  console.log(btcAssetContract);

  // Fetch user's corresponding contract address using its client_id
  const userAddress = await registry.fetchUserContract(
    '2fd00f14-ed87-4aaf-ab91-e37659a65a25'
  );
  console.log(userAddress);
}

main();
