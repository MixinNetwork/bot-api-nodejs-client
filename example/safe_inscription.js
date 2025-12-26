const { MixinApi } = require('..');
const keystore = require('../keystore.json');
const { v4 } = require('uuid');

const main = async () => {
  console.log(keystore);

  const client = MixinApi({ keystore });
  const collection = await client.safe.fetchInscriptionCollection('b3979998b8b5e705d553288bffd96d4e1cc719f3ae0b01ecac8539e1df81c16f');
  console.log('collection: ', collection);
  const item = await client.safe.fetchInscriptionItem('94d20f04829dcfb2c6d3cdb7ba94b3f6b402eb0537d6aa48f76e14d21e84c784');
  console.log('item: ', item);

  //   const items = await client.safe.fetchInscriptionItems('b3979998b8b5e705d553288bffd96d4e1cc719f3ae0b01ecac8539e1df81c16f');
  //   for (const item of items) {
  //     console.log('item: ', item);
  //   }
};

main();
