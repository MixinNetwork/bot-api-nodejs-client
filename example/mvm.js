const { Client, extraGeneratorByInfo, getMvmTransaction, getAssetIDByAddress, getContractByUserIDOrAssetID } = require('mixin-node-sdk')
const fs = require('fs')
const keystore = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'))
const client = new Client(keystore)

async function main() {
  // 1. 使用参数进行生成 extra
  const extra = extraGeneratorByInfo(
    '0x7c15d0D2faA1b63862880Bed982bd3020e1f1A9A', // 要调用的合约地址
    'addLiquidity', // 上述合约里的方法名称
    ['address', 'uint256'], // 上述方法里的参数类型
    ['0xA95664B451dE7E85e5E743AFD0F8f4d2A57eD11a', '20000'] // 上述方法里的参数的值
  )
  // 注意, mvm 里的资产 decimal 是 8.
  // 所以, 如果要转账 0.0002 那么上述构建 extra 要转账的金额就是 0.0002 * 1e8 = 20000
  // 2. 使用生成的 extra 来构建交易
  const transactionInput = getMvmTransaction({
    amount: '0.0002',
    asset: '965e5c6e-434c-3fa9-b780-c50f43cd955c', // cnb 的 asset_id
    trace: 'uuid', // uuid 可以为空,
    extra,
  })
  // 3. 可以直接调用 /transaction 付款,
  //  也可以生成一个 code_id 来调起客户端的付款
  const res = await client.verifyPayment(transactionInput)
  console.log(res)
  console.log(`mixin://codes/${res.code_id}`)


  const cnbAssetID = await getAssetIDByAddress('0xA95664B451dE7E85e5E743AFD0F8f4d2A57eD11a') // cnb 的地址
  console.log(cnbAssetID) // 965e5c6e-434c-3fa9-b780-c50f43cd955c 

  const btcAssetContract = await getContractByUserIDOrAssetID('c6d0c728-2624-429b-8e0d-d9d19b6592fa')
  console.log(btcAssetContract)
}

main()