const {
  MVMApi,
  MVMMainnet,
  MVMApiTestURI,
  getExtra
} = require('mixin-node-sdk');

const mvmClient = MVMApi(MVMApiTestURI);

async function main() {
  const contractAddress = '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0'; // 要调用的合约地址
  const methodName = 'addAny'; // 要调用的合约方法
  const types = ['uint256']; // 参数类型列表
  const values = [2]; // 参数值列表

  const extra = getExtra(contractAddress, methodName, types, values);
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
  const res = await mvmClient.payments(transactionInput);
  console.log(res);
}

main();