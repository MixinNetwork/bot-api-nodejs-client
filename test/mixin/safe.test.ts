import { encodeSafeTransaction, decodeSafeTransaction, signSafeTransaction, MixinApi, newKeyFromSeed, getMainnetAddressFromSeed, SafeTransactionRecipient } from '../../src';

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
      extra: Buffer.from('test-memo'),
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
      references: [],
      signatureMap: [],
    };
    const unsignedRaw = encodeSafeTransaction(tx);
    expect(unsignedRaw).toEqual(raw1);

    const signedRaw = signSafeTransaction(tx, views, priv);
    expect(signedRaw).toEqual(raw2);
  });

  test('Test for safe transaction unmarshal', () => {
    const raw =
      '77770005f3bed3e0f6738938c8988eb8853c5647baa263901deb217ee53586d5de831f3b0001b5ecd453883aebc2a0dfe6c3f005c06c59156b70c532c363c7dff6ca4329d0ed00000000000000000002000000022710000b3720de3095a80e5778c266471193a9404cbbf876f7e66c6c5f9126cb4624f2b097bdc4ccdcaf213abe138aeaf7e65df0a207be975ebe30ab136b128676989a235d877764ed21f4b96d66f81e4ceb0896d81aee81f74065a08e80a0b09d48ebadb10ce899bd793a9741cab5d7a3e4385fd920244847de1a7af86a40db7d584bbea5af14afffbc0cd3014c6f1370df394780966f440dca4acbdcf4102defe325972ebe24a114a331d5fff0d19ac4340801f7cd0d39c46ff71c801ae774a8d91f36051312e4daf0b6a32f4b286de370db381ccb7a30c8fb10a74fe0b88388b3ee8791b828cf0ee8ff9a5ab96cd6a4332a6c758339875026af7ba41670ea50e5930d746e35b89fc88259d46a45f5ab5b6a6aaed73d78a3711d633e23a017e922c6471ac457e96bee19665a179c820897aab4c4ed16b79da142dc6458b7ff66094a803c86daadbc99dbfc3d218fb85fefdc8f0e9818057965819598a892b647a00f65d0daa2de9d547edd3a300a3c366e4cbdc3d38b841b84bba748e9d788e0f9f8e90003fffe0200000000000405f5b9f0000b6886794f8ad4b99fe21eb6b80342bdabb5789e124d860831acb7ba70968ebefd9492fbec7993349bdb64fa1e9df89913eac2121cd24894f609305af12ee89913b268eed77794fa0caf1391c7c2dc9eda9d94fda92d75b66f09d41133057e92e2fb645be1cd74429d65cc082aaaaa7803ba7192daf5a77361b35b346293da3eb24449ab5ec302fa2279ccb27b2f25269daff0dbd3d377d729dfe480ff63b0fee84b7392595e645d58f1a1f28781bd05a781305263a81afca8e599f1e7c45458d5c6bf5b4c81bc4872de98a2099364f3013119f715c120ad3fb663abdd9e25fa60cce3eb4f9d6546b18fff2fd145860ed8819f7b75edb8e3a8542942e078541de3125ceb37b571249808e18f10fd53ed8abd6eb438ab4ec98f57766b0e3e74834e4f9121fab9e57e3ad4dd8eb73e017eaaf142d2a5d4beddafe8bc5198a90efe91e769a91c5af97d7972bd38a984f66b060dd5a24c8fc8d2ce9969fe689d258916c295b730f477c2a605e9044da395575a0d9f395c890f1d70a40be812a04922710003fffe0200000000000000136d756c7469736967732d746573742d6d656d6f0000';
    const tx = decodeSafeTransaction(raw);

    expect(tx.asset).toBe('f3bed3e0f6738938c8988eb8853c5647baa263901deb217ee53586d5de831f3b');
    expect(tx.extra.toString()).toBe('multisigs-test-memo');

    expect(tx.inputs).toHaveLength(1);
    expect(tx.inputs[0].hash).toBe('b5ecd453883aebc2a0dfe6c3f005c06c59156b70c532c363c7dff6ca4329d0ed');
    expect(tx.inputs[0].index).toBe(0);

    expect(tx.outputs).toHaveLength(2);
    expect(tx.outputs[0].type).toBe(0);
    expect(tx.outputs[0].amount).toBe('0.0001');
    expect(tx.outputs[0].mask).toBe('d0daa2de9d547edd3a300a3c366e4cbdc3d38b841b84bba748e9d788e0f9f8e9');
    expect(tx.outputs[0].script).toBe('fffe02');
    expect(tx.outputs[0].keys?.join(',')).toBe(
      [
        '3720de3095a80e5778c266471193a9404cbbf876f7e66c6c5f9126cb4624f2b0',
        '97bdc4ccdcaf213abe138aeaf7e65df0a207be975ebe30ab136b128676989a23',
        '5d877764ed21f4b96d66f81e4ceb0896d81aee81f74065a08e80a0b09d48ebad',
        'b10ce899bd793a9741cab5d7a3e4385fd920244847de1a7af86a40db7d584bbe',
        'a5af14afffbc0cd3014c6f1370df394780966f440dca4acbdcf4102defe32597',
        '2ebe24a114a331d5fff0d19ac4340801f7cd0d39c46ff71c801ae774a8d91f36',
        '051312e4daf0b6a32f4b286de370db381ccb7a30c8fb10a74fe0b88388b3ee87',
        '91b828cf0ee8ff9a5ab96cd6a4332a6c758339875026af7ba41670ea50e5930d',
        '746e35b89fc88259d46a45f5ab5b6a6aaed73d78a3711d633e23a017e922c647',
        '1ac457e96bee19665a179c820897aab4c4ed16b79da142dc6458b7ff66094a80',
        '3c86daadbc99dbfc3d218fb85fefdc8f0e9818057965819598a892b647a00f65',
      ].join(','),
    );
    expect(tx.outputs[1].type).toBe(0);
    expect(tx.outputs[1].amount).toBe('0.9999');
    expect(tx.outputs[1].mask).toBe('c295b730f477c2a605e9044da395575a0d9f395c890f1d70a40be812a0492271');
    expect(tx.outputs[1].script).toBe('fffe02');
    expect(tx.outputs[1].keys?.join(',')).toBe(
      [
        '6886794f8ad4b99fe21eb6b80342bdabb5789e124d860831acb7ba70968ebefd',
        '9492fbec7993349bdb64fa1e9df89913eac2121cd24894f609305af12ee89913',
        'b268eed77794fa0caf1391c7c2dc9eda9d94fda92d75b66f09d41133057e92e2',
        'fb645be1cd74429d65cc082aaaaa7803ba7192daf5a77361b35b346293da3eb2',
        '4449ab5ec302fa2279ccb27b2f25269daff0dbd3d377d729dfe480ff63b0fee8',
        '4b7392595e645d58f1a1f28781bd05a781305263a81afca8e599f1e7c45458d5',
        'c6bf5b4c81bc4872de98a2099364f3013119f715c120ad3fb663abdd9e25fa60',
        'cce3eb4f9d6546b18fff2fd145860ed8819f7b75edb8e3a8542942e078541de3',
        '125ceb37b571249808e18f10fd53ed8abd6eb438ab4ec98f57766b0e3e74834e',
        '4f9121fab9e57e3ad4dd8eb73e017eaaf142d2a5d4beddafe8bc5198a90efe91',
        'e769a91c5af97d7972bd38a984f66b060dd5a24c8fc8d2ce9969fe689d258916',
      ].join(','),
    );
  });

  test('Test for safe ghost key for mainnet address', async () => {
    const client = MixinApi();
    const seed = Buffer.alloc(64).fill(1);

    const trace = '9dc60d4c-f301-48ef-97f2-32e9195648cb';
    const key = newKeyFromSeed(seed);
    expect(key.toString('hex')).toBe('4fe2a684e0e6c5e370ca0d89f5e2cb0da1e2ecd4028fa2d395fbca4e33f25805');
    const addr1 = getMainnetAddressFromSeed(seed);
    expect(addr1).toBe('XINSwYaJPnKiwBWqXm4i3e3My9GKguReMRyB1sRSexeHcQ7V66RWsicAiR2dokcQ5kiJsfY5QbEjTcqRQRCxkEyENBaz4AeB');
    const addr2 = getMainnetAddressFromSeed(Buffer.alloc(64).fill(2));
    expect(addr2).toBe('XINPDSvrzuxs25wN8pWT7iiDBExA532LbCbUxYLzQboWtca7NKCtPZaphpWWkc98iDPcKkLFT9UHFbXrM5iR5GcTU5tZq4bG');

    const rs: SafeTransactionRecipient[] = [
      {
        mixAddress: {
          version: 2,
          xinMembers: [addr1],
          uuidMembers: [],
          threshold: 64,
        },
        amount: '0.0001',
      },
      {
        mixAddress: {
          version: 2,
          xinMembers: [addr1, addr2],
          uuidMembers: [],
          threshold: 64,
        },
        amount: '0.0001',
      },
    ];

    const keys = await client.utxo.ghostKey(rs, trace, key.toString('hex'));
    expect(keys).toHaveLength(2);
    expect(keys[0]).not.toBeUndefined();
    expect(keys[1]).not.toBeUndefined();
    expect(keys[0]!.mask).toBe('8084fd07352c375b70811ff4e107230f8afbe1bdd8cc812c69885d80d11f2bc1');
    expect(keys[0]!.keys.join(',')).toBe('d12872616e533da045518baabdffd6aa0a17c23f01d82cc1c1e480067aaa5937');
    expect(keys[1]!.mask).toBe('e6aec07aec6a60d4173784c3b7aaae541edd61dc6b08c1bc23ccdb554d133829');
    expect(keys[1]!.keys.join(',')).toBe('1c241e7500766edf7b998eaffd25173320d15f74c0a5ebc18ebf9e21bac88ee6,c244a3802638aec132eab23322bf6261b4defd2e3af497d95675270bb3b604e8');
  });
});
