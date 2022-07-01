const { MVMApi, MVMMainnet, getExtra } = require('@mixin.dev/mixin-node-sdk');
const { v4 } = require('uuid');
const keystore = require('../keystore.json');

keystore.user_id = keystore.client_id;

// TODO: MVMApi deployed url
const mvmClient = MVMApi('http://localhost:9091');

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
  // contracts array
  const contracts = [
    contractReadCount,
    contractAddOneCount,
    contractReadCount,
    contractAddAnyCount,
    contractReadCount,
  ];

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
  // 3. when extra.length > 200，use mvmClient.payments() to get code_id，then post /transaction to pay
  const res = await mvmClient.payments(transactionInput);
  console.log(res);
  // you can also use mixin address to pay in Mixin Messenger
  console.log(`mixin://codes/${res.code_id}`);
}

main();
