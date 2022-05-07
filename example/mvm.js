const { Client,
  extraGeneratByInfo,
  paymentGeneratByInfo,
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
  const extra = extraGeneratByInfo({
    contractAddress: '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0', // 要调用的合约地址
    methodName: 'addAny', // 要调用的合约方法
    types: ['uint256'], // 参数类型列表
    values: [2] // 参数值列表
  })

  // 1.2 使用 abi 进程生成 extra
  // const paramsGenerator = abiParamsGenerator(
  //   '0x4f31E2eAF25DCDD46651AcE019B61E3E750023E0', // 要调用的合约地址
  //   abi, // 合约的 abi
  // )
  // 直接用 paramsGenerator 调用合约方法然后传参就可以了
  // const extra = paramsGenerator.addAny(2)
  const transactionInput = getMvmTransaction({
    amount: '0.00000001',
    asset: '965e5c6e-434c-3fa9-b780-c50f43cd955c', // cnb 的 asset_id
    trace: 'uuid', // uuid 可以为空,
    extra,
  })
  // 3. 可以直接调用 /transaction 付款,
  //  也可以生成一个 code_id 来调起客户端的付款
  const res = await client.verifyPayment(transactionInput)
  console.log(res)
  console.log(`mixin://codes/${res.code_id}`)


  const cnbAssetID = await getAssetIDByAddress('0xbE48C98736E54c99d92f1616e90FC944Deb64030') // cnb 的地址
  console.log(cnbAssetID) // 965e5c6e-434c-3fa9-b780-c50f43cd955c 

  const btcAssetContract = await getContractByAssetID('c6d0c728-2624-429b-8e0d-d9d19b6592fa')
  console.log(btcAssetContract) // 0xe2E4137FF1553F2845084E3965E27937674264FC

  const userAddress = await getContractByUserIDs('e8e8cd79-cd40-4796-8c54-3a13cfe50115')
  console.log(userAddress) // 0xc49E0F42A844273E41F0d00e8C2406468b55AFEa
}

async function paymentTest() {
  const t = await paymentGeneratByInfo({
    contractAddress: '0x4883Ae7CB5c3Cf9219Aeb02d010F2F6Ef353C40c',
    methodName: 'addAny',
    types: ['uint256'],
    values: ['11'],
    payment: {
      type: 'tx'
    }
  })

  const tx = await client.transaction(t)
  console.log(t)
  console.log(tx)
}

main()
