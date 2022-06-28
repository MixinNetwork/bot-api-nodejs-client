const {
  MixinApi,
  MVMApi,
  MVMMainnet,
  MVMApiTestURI,
  Registry,
  getExtra
} = require('@mixin.dev/mixin-node-sdk');
const keystore = require('../keystore.json');

const mixinClient = MixinApi({ keystore });
const mvmClient = MVMApi(MVMApiTestURI);
const registry = new Registry({
  address: MVMMainnet.Registry.Contract,
  uri: MVMMainnet.RPCUri,
  secret: keystore.private_key,
});

async function main() {
  const contract1 = {
    address: '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0', // 要调用的合约地址
    method: 'addAny', // 要调用的合约方法
    types: ['uint256'], // 参数类型列表
    values: [2] // 参数值列表
  };
  const contract2 = {
    address: '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0', // 要调用的合约地址
    method: 'addOne', // 要调用的合约方法
  };
  const contracts = [contract1, contract2];

  // 1 使用参数进行生成 extra
  const extra = getExtra(contracts);
  // 2 构造 payments 请求
  const transactionInput = {
    asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c', // cnb 的 asset_id
    amount: '0.00000001',
    trace: 'uuid', // uuid 可以为空,
    memo: extra,
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    }
  };

  // 3. 可以直接调用 /transaction 付款,
  //    也可以生成一个 code_id 来调起客户端的付款
  const res = await mvmClient.payments(transactionInput);
  console.log(res);
  console.log(`mixin://codes/${res.code_id}`);

  const cnbAssetID = await registry.fetchContractAsset('0xbE48C98736E54c99d92f1616e90FC944Deb64030'); // cnb 的地址
  console.log(cnbAssetID);

  const btcAssetContract = await registry.fetchAssetContract('c6d0c728-2624-429b-8e0d-d9d19b6592fa');
  console.log(btcAssetContract);

  const userAddress = await registry.fetchUserContract('e8e8cd79-cd40-4796-8c54-3a13cfe50115');
  console.log(userAddress);
}

async function paymentTest() {
  const contract = {
    address: '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0', // 要调用的合约地址
    method: 'addAny', // 要调用的合约方法
    types: ['uint256'], // 参数类型列表
    values: [2] // 参数值列表
  };
  const contracts = [contract];

  const extra = getExtra(contracts);
  const t = {
    asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c', // cnb 的 asset_id
    amount: '0.00000001',
    trace: 'uuid', // uuid 可以为空,
    memo: extra,
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    }
  };

  const tx = await mixinClient.transfer.toAddress(keystore.pin, t);
  console.log(t);
  console.log(tx);
}

main();
