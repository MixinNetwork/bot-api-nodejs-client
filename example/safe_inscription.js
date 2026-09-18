const { MixinApi } = require('..');
const keystore = require('../keystore.json');

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

  // the spend private key defaults to keystore.spend_private_key
  //   const results = await client.safe.transferInscription({
  //     inscriptionHash: '94d20f04829dcfb2c6d3cdb7ba94b3f6b402eb0537d6aa48f76e14d21e84c784',
  //     receivers: ['7766b24c-1a03-4c3a-83a3-b4358266875d'],
  //     threshold: 1,
  //     memo: 'enjoy your collectible',
  //   });
  //   console.log('transfer results: ', results);

  // or spend a known inscription output directly
  //   const outputs = await client.utxo.safeOutputs({ state: 'unspent' });
  //   const utxo = outputs.find(o => o.inscription_hash);
  //   const results = await client.safe.transferInscription({
  //     utxo,
  //     receivers: ['7766b24c-1a03-4c3a-83a3-b4358266875d'],
  //     threshold: 1,
  //   });
  //   console.log('transfer results: ', results);
};

main();
