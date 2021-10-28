import { client } from './common'
import { v4 as uuid } from 'uuid'

describe('address', () => {
  it("create nft", async () => {
    const id = uuid()

    const tr = client.newMintCollectibleTransferInput({
      trace_id: id,
      collection_id: id,
      token_id: id,
      content: "test"
    })

    const payment = await client.verifyPayment(tr)
    console.log("mint collectibles", id, `mixin://codes/${payment.code_id}`)
    expect(payment.trace_id).toEqual(id)
  })
})

