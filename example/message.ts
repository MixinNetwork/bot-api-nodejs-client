const { MixinApi, base64RawURLEncode } = require('..');
const keystore = require('../keystore.json');
const { v4 } = require('uuid');

const main = async () => {
  console.log(keystore);

  const client = MixinApi({ keystore });

  const conv = await client.conversation.createContact("opponent-id")

  const resp = await client.message.sendLegacy({
    conversation_id: conv.conversation_id,
    message_id: v4(),
    category: 'PLAIN_TEXT',
    data_base64: base64RawURLEncode('hi'),
  });
  console.log(resp);
};

main();
