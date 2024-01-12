# bot-api-nodejs-client

mixin 的 js 版 sdk

## 新版本特性

1. 更友好的类型和代码提示
2. 更规范的函数命名
3. 更全面的测试覆盖

## 安装

```shell
npm install @mixin.dev/mixin-node-sdk
```

使用 `yarn` 安装

```shell
yarn add @mixin.dev/mixin-node-sdk
```

## 使用

1. 仅使用 Mixin 的 Api

```js
const { MixinApi } = require('@mixin.dev/mixin-node-sdk');

const keystore = {
  app_id: '',
  session_id: '',
  server_public_key: '',
  session_private_key: '',
};
const client = MixinApi({ keystore });

// 使用 Promise
client.user.profile().then(console.log);
// 使用 async await
async function getMe() {
  const me = await client.user.profile();
  console.log(me);
}
```

2. 使用 Mixin 的消息功能

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

## 贡献

可接受 PRs.

## API

> 1. [https://developers.mixin.one/docs/api-overview](https://developers.mixin.one/docs/api-overview)

## 版本所有

Copyright 2024 Mixin.
