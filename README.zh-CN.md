# bot-api-nodejs-client

mixin 的 nodejs 版 sdk

## 新版本特性

1. 更友好的类型和代码提示
2. 更规范的函数命名
3. 更全面的测试覆盖

## 安装

```shell
npm install @mixin.dev/mixin-node-sdk
```

如果你使用 `yarn`

```shell
yarn add @mixin.dev/mixin-node-sdk
```

## 使用

1. 仅使用 Mixin 的 Api

```js
const { MixinApi } = require('@mixin.dev/mixin-node-sdk');

const keystore = {
  user_id: '',
  authorization_id: '',
  scope: '',
  private_key: '',
  sign: 'oauth'
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

2. 使用 Mixin 的消息功能()

```js
const { MixinApi } = require('mixin-node-sdk');

const keystore = {
  user_id: '',
  authorization_id: '',
  scope: '',
  private_key: '',
  sign: 'oauth'
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

## 贡献

可接受 PRs.

## API

> 1. [https://developers.mixin.one/docs/api-overview](https://developers.mixin.one/docs/api-overview)

## License

Copyright 2021 Mixin.