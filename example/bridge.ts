const { BridgeApi } = require('..');

async function main() {
  const r = await BridgeApi().register({ public_key: '0x5fCaB872A5B0056cD8649885425d9309d14AE7b7' });
  console.log(`mixin://transfer/${r.key.client_id}`);
}

main();
