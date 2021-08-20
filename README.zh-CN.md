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
```js
const { Client } = require('mixin-node-sdk')
const client = new Client({
  "client_id": "",
  "session_id": "",
  "pin_token": "",
  "private_key": "",
  "pin": "",
  "client_secret": ""
})
// 使用 Promise
client.userMe().then(console.log)

// 使用 async await
async function getMe() {
  const me = await client.userMe()
  console.log(me)
}
```



## 注意
1. 如果你使用的是 `mixin-node-sdk@2.xx.xx` 的版本，请看 [https://github.com/liuzemei/mixin-node-sdk](https://github.com/liuzemei/mixin-node-sdk)



## 贡献

可接受 PRs.


## 相关文章或链接
> 1. [https://developers.mixin.one/document](https://developers.mixin.one/document)
> 2. [https://github.com/fox-one/mixin-sdk-go](https://github.com/fox-one/mixin-sdk-go)
> 3. [https://mixin.one](https://mixin.one)



## License

MIT © Richard McRichface



