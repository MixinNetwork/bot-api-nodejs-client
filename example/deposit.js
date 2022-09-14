const { Wallet, ethers } = require('ethers');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { MixinAssetID, BridgeApi, MixinApi } = require('..');

const depositAsset = MixinAssetID; // asset_id of ETH
const amount = '0.0001';

const privateKey = ''; // private key of wallet
const provider = new JsonRpcProvider('https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7');
const signer = new Wallet(privateKey, provider);

const main = async () => {
  // Get the Mixin User bound to an address
  const bridgeClient = BridgeApi();
  const user = await bridgeClient.register({
    public_key: await signer.getAddress()
  });

  // Fetch the deposit address of a specific asset
  const mixinClient = MixinApi({
    keystore: {
      ...user,
      ...user.key
    }
  })
  const { destination } = await mixinClient.asset.fetch(depositAsset);

  // Send tx
  // You may need to wait a few minutes to get the deposit asset
  console.log(`balance before: ${ethers.utils.formatEther(await signer.getBalance())}`);
  const tx = {
    to: destination,
    value: ethers.utils.parseEther(amount)
  };
  const receipt = await signer.sendTransaction(tx);
  await receipt.wait();
  console.log(`balance after: ${ethers.utils.formatEther(await signer.getBalance())}`);
}

main();
