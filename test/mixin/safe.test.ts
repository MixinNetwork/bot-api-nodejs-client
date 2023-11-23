import { v4 } from 'uuid';
import { encodeSafeTransaction, signSafeTransaction, getMainnetAddressGhostKey } from '../../src';

describe('Tests for safe', () => {
  test('Test for safe transaction signature', async () => {
    const raw1 =
      '77770005b9f49cf777dc4d03bc54cd1367eebca319f8603ea1ce18910d09e2c540c630d80001c513ffcc684e9585c76bd76245aa7d2def3b9f147422b59ab91db7852c9d97dd000000000000000000010000000405f5e1000001a6c306c3137c2bf4a8bfc95ea5165f7777020916aa36ee6ec394beb9a1e6a164286d4f092015ea327ba12145edd40ddede1bdd80f777c249128d38176e352a130003fffe010000000000000009746573742d6d656d6f0000';
    const raw2 =
      '77770005b9f49cf777dc4d03bc54cd1367eebca319f8603ea1ce18910d09e2c540c630d80001c513ffcc684e9585c76bd76245aa7d2def3b9f147422b59ab91db7852c9d97dd000000000000000000010000000405f5e1000001a6c306c3137c2bf4a8bfc95ea5165f7777020916aa36ee6ec394beb9a1e6a164286d4f092015ea327ba12145edd40ddede1bdd80f777c249128d38176e352a130003fffe010000000000000009746573742d6d656d6f000100010000fde63b999d519394b3ba8a99a9f1d44bc91c2ee73d472d2085fa222925732889159042b126b4436766d6d3308ee541c50fc1b9b8b83701ac534c68e7f4d0f50c';
    const views = ['0164ba23d5aa1953132bc0bf5d12d0af7e66de2ba8773701ef135e015f24bb0b'];
    const priv = '7fb3893475a82c85e2b3c8a9a9232eddb36651ac32fa98ae83e6c2f33fb1be84dea64fa32b3b01f9a059142c0e9535a57b69f676790ae64f6d52f9a06d90f11e';

    const tx = {
      version: 5,
      asset: 'b9f49cf777dc4d03bc54cd1367eebca319f8603ea1ce18910d09e2c540c630d8',
      extra: 'test-memo',
      inputs: [
        {
          hash: 'c513ffcc684e9585c76bd76245aa7d2def3b9f147422b59ab91db7852c9d97dd',
          index: 0,
        },
      ],
      outputs: [
        {
          type: 0,
          amount: '1',
          keys: ['a6c306c3137c2bf4a8bfc95ea5165f7777020916aa36ee6ec394beb9a1e6a164'],
          mask: '286d4f092015ea327ba12145edd40ddede1bdd80f777c249128d38176e352a13',
          script: 'fffe01',
        },
      ],
    };
    const unsignedRaw = encodeSafeTransaction(tx);
    expect(unsignedRaw).toEqual(raw1);

    const signedRaw = await signSafeTransaction(tx, views, priv);
    expect(signedRaw).toEqual(raw2);
  });

  test('Test for safe ghost key for mainnet address', () => {
    const ghostKey = getMainnetAddressGhostKey(
      {
        receivers: ['XINJkpCdwVk3qFqmS3AAAoTmC5Gm2fR3iRF7Rtt7hayuaLXNrtztS3LGPSxTmq5KQh3KJ2qYXYE5a9w8BWXhZAdsJKXqcvUr'],
        index: 255,
        hint: v4(),
      },
      '518fad2b5eb4ddbd64d2bd5537a73266451ac0eeaff044d6d4e1adfe09da9373ce6ad9b1bc2b55e371c452f84472d741c927989dc3ea91773964492618c02ece',
    );
    expect(ghostKey?.mask).toEqual('f2459f77513526c156a5cf2ec831e849b75514f0614e2bd7acdde70afc224f40');
    expect(ghostKey?.keys[0]).toEqual('40567a0c5696cd3c7160f910248e9bae36cee90d625bba4dbf7ed03d272b2e61');
  });
});
