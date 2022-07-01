const { v4 } = require('uuid');
const {
  MixinApi,
  MVMMainnet,
  Registry,
  getExtra,
} = require('@mixin.dev/mixin-node-sdk');
const keystore = require('../keystore.json');

keystore.user_id = keystore.client_id;

const mixinClient = MixinApi({ keystore });
const registry = new Registry({
  address: MVMMainnet.Registry.Contract,
  uri: MVMMainnet.RPCUri,
});

async function main() {
  const contractReadCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'count', // contract function
  };
  const contractAddOneCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'addOne', // contract function
  };
  // contracts array
  const contracts = [contractReadCount, contractAddOneCount, contractReadCount];

  // 1 build extra for contracts
  const extra = getExtra(contracts);
  // 2 build request to generate payment
  const transactionInput = {
    // '965e5c6e-434c-3fa9-b780-c50f43cd955c' cnb asset_id
    asset_id: 'c94ac88f-4671-3976-b60a-09064f1811e8', // XIN asset_id
    amount: '0.00000001',
    trace_id: v4(),
    memo: extra,
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    },
  };

  console.log(extra.length);
  // 3. when extra.length <= 200，use mixinClient.payment.request() to get code_id，then post /transaction to pay
  const res = await mixinClient.payment.request(transactionInput);
  // you can also use mixin address to pay in Mixin Messenger
  console.log(`mixin://codes/${res.code_id}`);

  // Fetch asset's asset_id using its contract address
  const cnbAssetID = await registry.fetchContractAsset(
    '0x910Fb1751B946C7D691905349eC5dD250EFBF40a'
  ); // cnb 的地址
  console.log(cnbAssetID);

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
