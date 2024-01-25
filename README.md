# bot-api-nodejs-client

The Node.js version of the mixin SDK [https://developers.mixin.one/docs/api-overview](https://developers.mixin.one/docs/api-overview)

[中文版](./README.zh-CN.md)

## New version features

1. More friendly type and code hints
2. More standardized function naming
3. More comprehensive test coverage

## Install

```shell
npm install @mixin.dev/mixin-node-sdk
```

If you use `yarn`

```shell
yarn add @mixin.dev/mixin-node-sdk
```

## Usage

1. Use Mixin API

```js
const { MixinApi } = require('@mixin.dev/mixin-node-sdk');

const keystore = {
  app_id: '',
  session_id: '',
  server_public_key: '',
  session_private_key: '',
};
const client = MixinApi({ keystore });

// Use Promise
client.user.profile().then(console.log);
// Use async await
async function getMe() {
  const me = await client.user.profile();
  console.log(me);
}
```

2. Receive Mixin Messenger messages

```js
const { MixinApi } = require('@mixin.dev/mixin-node-sdk');

const keystore = {
  app_id: '',
  session_id: '',
  server_public_key: '',
  session_private_key: '',
};
const config = {
  keystore,
  blazeOptions: {
    parse: true,
    syncAck: true,
  },
};

const client = MixinApi(config);
client.blaze.loop({
  onMessage(msg) {
    console.log(msg);
  },
});
```

3. OAuth

```js
const { MixinApi, getED25519KeyPair, base64RawURLEncode } = require('@mixin.dev/mixin-node-sdk');

const code = ''; // from OAuth url
const app_id = ''; // app_id of your bot
const client_secret = ''; // OAuth Client Secret of your bot

const { seed, publicKey } = getED25519KeyPair(); // Generate random seed and ed25519 key pairs

let client = MixinApi();
const { scope, authorization_id } = await client.oauth.getToken({
  client_id: app_id,
  code,
  ed25519: base64RawURLEncode(publicKey),
  client_secret,
});
const keystore = {
  app_id,
  scope,
  authorization_id,
  session_private_key: Buffer.from(seed).toString('hex'),
};
client = MixinApi({ keystore });
const user = await client.user.profile();
```

## Use the sdk in web browser

This SDK uses node `Buffer`, which is not available in web browser. You can use polyfills to make it work.

For example, you can use `vite-plugin-node-polyfills` for vite.

```js
// vite.config.js
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// ...
export default defineConfig({
  // ...
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
});
```

## License

```
Copyright 2024 Mixin.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
