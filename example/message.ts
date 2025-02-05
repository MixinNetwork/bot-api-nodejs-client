const { MixinApi, base64RawURLEncode } = require('..');
const keystore = require('../keystore.json');
const { v4 } = require('uuid');

const main = async () => {
  console.log(keystore);

  const client = MixinApi({ keystore });

  const resp = await client.message.sendLegacy({
    conversation_id: '9451292c-c81c-4574-961a-ce9075e32400',
    message_id: v4(),
    category: 'PLAIN_TEXT',
    data_base64: base64RawURLEncode('hi'),
  });
  console.log(resp);
};

main();
