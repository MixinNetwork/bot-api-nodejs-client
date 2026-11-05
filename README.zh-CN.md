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

所有 Mixin API 请求（包括网络查询和 OAuth token 交换）都必须传入 keystore。`MixinApi({ keystore })` 和独立客户端均要求该参数，Authorization 请求头不能代替 keystore。SDK 会自动签名请求。

请求签名使用 `SessionKeystore`：包含 `app_id`、`session_private_key` 和可选的 `session_id`。登录前尚未获取 session 时，JWT 的 `sid` 为空字符串，与 Go 客户端保持一致。OAuth 登录后使用已有的 `OAuthKeystore`，传入 `authorization_id` 和 `scope`。`AppKeystore` 和 `NetworkUserKeystore` 继续保留 PIN、Safe 操作需要的额外字段。

2. 使用 Mixin 的消息功能

```js
const { BlazeKeystoreClient } = require('@mixin.dev/mixin-node-sdk/blaze');

const keystore = {
  app_id: '',
  session_id: '',
  server_public_key: '',
  session_private_key: '',
};
const config = {
  parse: true,
  syncAck: true,
};

const client = BlazeKeystoreClient(keystore, config);
client.loop({
  onMessage(msg) {
    console.log(msg);
  },
});
```

3. OAuth 授权

```js
const { MixinApi, getED25519KeyPair, base64RawURLEncode } = require('@mixin.dev/mixin-node-sdk');

const code = ''; // from OAuth url
const app_id = ''; // app_id of your bot
const client_secret = ''; // OAuth Client Secret of your bot

const { seed, publicKey } = getED25519KeyPair(); // Generate random seed and ed25519 key pairs

// 登录前使用刚生成的私钥为 token 交换请求签名，此时还没有 session。
let client = MixinApi({
  keystore: { app_id, session_private_key: Buffer.from(seed).toString('hex') },
});
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

## 贡献

可接受 PRs.

## API

> 1. [https://developers.mixin.one/docs/api-overview](https://developers.mixin.one/docs/api-overview)

## 版本所有

Copyright 2024 Mixin.
