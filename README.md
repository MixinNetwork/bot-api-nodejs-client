# bot-api-nodejs-client

The Node.js version of the mixin SDK

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
  user_id: '',
  private_key: '',
  session_id: '',
  pin: '',
  pin_token: '',
  client_secret: ''
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
  user_id: '',
  private_key: '',
  session_id: '',
  pin: '',
  pin_token: '',
  client_secret: ''
};
const config = {
  keystore,
  blazeOptions: { 
    parse: true, 
    syncAck: true 
  },
};

const client = MixinApi(config);
client.blaze.loop({
  onMessage(msg) {
    console.log(msg);
  },
});
```

## Contribute

Acceptable PRs.

## API

> 1. [https://developers.mixin.one/docs/api-overview](https://developers.mixin.one/docs/api-overview)

## License

```
Copyright 2022 Mixin.

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
