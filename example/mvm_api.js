const axios = require('axios').default

const paymentURL = `https://mvm-api.test.mixinbots.com/payment`

async function main() {
  const { data: txInput } = await axios.post(paymentURL, {
    contractAddress: '0x4883Ae7CB5c3Cf9219Aeb02d010F2F6Ef353C40c',
    methodName: 'addAny',
    types: ['uint256'],
    values: ['11'],
    payment: { type: 'tx' }
  })
  console.log(txInput)

  const { data: payment } = await axios.post(paymentURL, {
    contractAddress: '0x4883Ae7CB5c3Cf9219Aeb02d010F2F6Ef353C40c',
    methodName: 'addAny',
    types: ['uint256'],
    values: ['11'],
  })
  console.log(payment)
}





