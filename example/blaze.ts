const { MixinApi } = require('..');
const keystore = require('../keystore.json');

keystore.user_id = keystore.client_id;
const client = MixinApi({
  keystore,
  blazeOptions: {
    parse: true,   // parse the message content by sdk
    syncAck: true, // automatically send read status after receiving message
  },
});

const handler = {
  // callback when receive message
  onMessage: async (msg) => {
    console.log('receive message: ', msg);

    // automatically reply
    const res = await client.message.sendText(msg.user_id, 'received') ;
    console.log(`message ${res.message_id} is sent`);
  },
  // callback when receive message status
  onAckReceipt: async (msg) => {
    console.log(`message ${msg.message_id} is ${msg.status}`)
  },
  // callback when receive transfer
  onTransfer: async (msg) => {
    const { data: transfer } = msg;
    const user = await client.user.fetch(transfer.counter_user_id);
    const asset = await client.asset.fetch(transfer.asset_id)
    console.log(`user ${user.full_name} transfer ${transfer.amount} ${asset.symbol} to you`);
  },
  // callback when group information update
  onConversation: async (msg) => {
    const group = await client.conversation.fetch(msg.conversation_id);
    console.log(`group ${group.name} information updated`);
  }
}
client.blaze.loop(handler);
