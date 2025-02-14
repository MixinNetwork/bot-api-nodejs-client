const { MixinApi } = require('..');
const keystore = require('../keystore.json'); // keystore from your bot

const client = MixinApi({
  keystore,
  blazeOptions: {
    parse: true, // parse the message content by sdk
    syncAck: true, // automatically send read status after receiving message
  },
});

const handler = {
  // callback when bot receive message
  onMessage: async msg => {
    const user = await client.user.fetch(msg.user_id);
    console.log(`${user.full_name} send you a ${msg.category} message: ${msg.data}`);

    // make your bot automatically reply
    const res = await client.message.sendText(msg.user_id, 'received');
    console.log(`message ${res.message_id} is sent`);
  },
  // callback when bot receive message status update
  // msg.source === 'ACKNOWLEDGE_MESSAGE_RECEIPT'
  onAckReceipt: async msg => {
    console.log(`message ${msg.message_id} is ${msg.status}`);
  },
  // callback when bot receive transfer
  // msg.category === 'SYSTEM_ACCOUNT_SNAPSHOT'
  // RECOMMEND use /snapshots api to listen transfer
  onTransfer: async msg => {
    const { data: transfer } = msg;
    const user = await client.user.fetch(transfer.counter_user_id);
    const asset = await client.asset.fetch(transfer.asset_id);
    console.log(`user ${user.full_name} transfer ${transfer.amount} ${asset.symbol} to you`);
  },
  // callback when group information update, which your bot is in
  // msg.category === 'SYSTEM_CONVERSATION'
  onConversation: async msg => {
    const group = await client.conversation.fetch(msg.conversation_id);
    console.log(`group ${group.name} information updated`);
  },
};
// ws will auto reconnect after connect closing
client.blaze.loop(handler);
