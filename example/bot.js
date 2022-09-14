const { MixinApi } = require('..');
const keystore = require('../keystore.json');

keystore.user_id = keystore.client_id;
const client = MixinApi({
  keystore,
  requestConfig: {
    responseCallback: err => {
      console.log(err);
    },
  },
});
client.user.fetch('7766b24c-1a03-4c3a-83a3-b4358266875d').then(res => console.log(res));
