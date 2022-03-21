const { Client,
  extraGeneratorByInfo,
  getMvmTransaction,
  getAssetIDByAddress,
  getContractByAssetID,
  getContractByUserIDs,
  abiParamsGenerator,
} = require('mixin-node-sdk')
const fs = require('fs')
const keystore = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'))
const client = new Client(keystore)

async function main() {
  // 1.1 使用参数进行生成 extra
  const extra = extraGeneratorByInfo(
    '0x7c15d0D2faA1b63862880Bed982bd3020e1f1A9A', // 要调用的合约地址
    'addLiquidity', // 上述合约里的方法名称
    ['address', 'uint256'], // 上述方法里的参数类型
    ['0xd630070b7a1fe4121a1b919947532493f6cc907f', '20000'] // 上述方法里的参数的值
  )

  // 1.2 使用 abi 进程生成 extra
  // const paramsGenerator = abiParamsGenerator(
  //   '0x7c15d0D2faA1b63862880Bed982bd3020e1f1A9A', // 要调用的合约地址
  //   abi, // 合约的 abi
  // )
  // 直接用 paramsGenerator 调用合约方法然后传参就可以了
  // const extra = paramsGenerator.addLiquidity('0xd630070b7a1fe4121a1b919947532493f6cc907f', '20000')

  // 1.1 和 1.2 生成 extra 是一样的

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


  const cnbAssetID = await getAssetIDByAddress('0xd630070b7a1fe4121a1b919947532493f6cc907f') // cnb 的地址
  console.log(cnbAssetID) // 965e5c6e-434c-3fa9-b780-c50f43cd955c 

  const btcAssetContract = await getContractByAssetID('c6d0c728-2624-429b-8e0d-d9d19b6592fa')
  console.log(btcAssetContract)

  const userAddress = await getContractByUserIDs('e8e8cd79-cd40-4796-8c54-3a13cfe50115')
  console.log(userAddress)
}

main()
