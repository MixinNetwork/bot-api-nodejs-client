const {
  MixinApi,
  MVMApi,
  MVMMainnet,
  MVMApiTestURI,
  Registry,
  getExtra } = require('mixin-node-sdk');
const fs = require('fs');

const keystore = JSON.parse(fs.readFileSync(`${__dirname  }/../config.json`, 'utf8'));
const mixinClient = MixinApi({ keystore });
const mvmClient = MVMApi(MVMApiTestURI);
const registry = Registry({
  address: MVMMainnet.Registry.Address,
  uri: MVMMainnet.RPCUri,
  secret: keystore.privateKey,
});

async function main() {
  const contractAddress = '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0'; // 要调用的合约地址
  const methodName = 'addAny'; // 要调用的合约方法
  const types = ['uint256']; // 参数类型列表
  const values = [2]; // 参数值列表

  // 1 使用参数进行生成 extra
  const extra = getExtra(contractAddress, methodName, types, values);
  // 2 构造 payments 请求
  const transactionInput = {
    asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c', // cnb 的 asset_id
    amount: '0.00000001',
    trace: 'uuid', // uuid 可以为空,
    extra,
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
  console.log(cnbAssetID); // 965e5c6e-434c-3fa9-b780-c50f43cd955c

  const btcAssetContract = await registry.fetchAssetContract('c6d0c728-2624-429b-8e0d-d9d19b6592fa');
  console.log(btcAssetContract); // 0xe2E4137FF1553F2845084E3965E27937674264FC

  const userAddress = await registry.fetchUserContract('e8e8cd79-cd40-4796-8c54-3a13cfe50115');
  console.log(userAddress); // 0xc49E0F42A844273E41F0d00e8C2406468b55AFEa
}

async function paymentTest() {
  const contractAddress = '0x4883Ae7CB5c3Cf9219Aeb02d010F2F6Ef353C40c';
  const methodName = 'addAny';
  const types = ['uint256'];
  const values = ['11'];

  const extra = getExtra(contractAddress, methodName, types, values);
  const t = {
    asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c', // cnb 的 asset_id
    amount: '0.00000001',
    trace: 'uuid', // uuid 可以为空,
    extra,
    opponent_multisig: {
      receivers: MVMMainnet.MVMMembers,
      threshold: MVMMainnet.MVMThreshold,
    }
  };

  const tx = await mixinClient.transfer.toAddress(t);
  console.log(t);
  console.log(tx);
}

main();
