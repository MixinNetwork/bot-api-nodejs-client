# bot-api-nodejs-client

mixin 的 nodejs 版 sdk

## 新版本特性

1. 更友好的类型和代码提示
2. 更规范的函数命名
3. 更全面的测试覆盖

## 安装

```shell
npm install mixin-node-sdk
```

如果你使用 `yarn`

```shell
yarn add mixin-node-sdk
```

## 使用

1. 仅使用 Mixin 的 Api

```js
const { Client } = require('mixin-node-sdk');
const client = new Client({
  client_id: '',
  session_id: '',
  pin_token: '',
  private_key: '',
  pin: '',
  client_secret: '',
});
// 使用 Promise
client.userMe().then(console.log);

// 使用 async await
async function getMe() {
  const me = await client.userMe();
  console.log(me);
}
```

2. 使用 Mixin 的消息功能()

```js
const { BlazeClient } = require('mixin-node-sdk');
const client = new BlazeClient(
  {
    client_id: '',
    session_id: '',
    pin_token: '',
    private_key: '',
    pin: '',
    client_secret: '',
  },
  { parse: true, syncAck: true },
);

client.loopBlaze({
  onMessage(msg) {
    console.log(msg);
  },
});
```

> BlazeClient 直接继承了 Client，所以所有 Client 的方法 BlazeClient 都可以直接调用。

## 贡献

可接受 PRs.

## API

> 1. [https://developers.mixin.one/docs/api-overview](https://developers.mixin.one/docs/api-overview)

## License

Copyright 2021 Mixin.