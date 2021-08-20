# bot-api-nodejs-client
[中文版](./README.zh-CN.md)

The nodejs version of the mixin SDK

## New version features
1. More friendly type and code hints
2. More standardized function naming
3. More comprehensive test coverage

## Install
```shell
npm install mixin-node-sdk
```
If you use `yarn`
```shell
yarn add mixin-node-sdk
```

## Usage
1. Use Mixin Api
```js
const {Client} = require('mixin-node-sdk')
const client = new Client({
  "client_id": "",
  "session_id": "",
  "pin_token": "",
  "private_key": "",
  "pin": "",
  "client_secret": ""
})
// Use Promise
client.userMe().then(console.log)

// use async await
async function getMe() {
  const me = await client.userMe()
  console.log(me)
}
```
2. Use Mixin's message
```js
const {BlazeClient} = require('mixin-node-sdk')
const client = new BlazeClient({
   "client_id": "",
   "session_id": "",
   "pin_token": "",
   "private_key": "",
   "pin": "",
   "client_secret": ""
}, {parse: true, syncAck: true})

client.loopBlaze({
   onMessage(msg){
     console.log(msg)
   },
})


```
> BlazeClient directly inherits Client, so all Client methods BlazeClient can be called directly.


## Note
1. If you are using the version of `mixin-node-sdk@2.xx.xx`, please see [https://github.com/liuzemei/mixin-node-sdk](https://github.com/liuzemei/mixin-node-sdk)



## Contribute

Acceptable PRs.


## Related articles or links
> 1. [https://developers.mixin.one/document](https://developers.mixin.one/document)
> 2. [https://github.com/fox-one/mixin-sdk-go](https://github.com/fox-one/mixin-sdk-go)
> 3. [https://mixin.one](https://mixin.one)



## License

MIT © Richard McRichface