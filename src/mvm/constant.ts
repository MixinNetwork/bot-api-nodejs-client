export const BlankAddress = '0x0000000000000000000000000000000000000000';

// TODO: needs to replace with mainnet data later
export const MVMMainnet = {
  ChainId: 83927,
  RPCUri: 'https://quorum-mayfly-testnet.mixin.zone',
  RPCUriAlpha: 'https://quorum-testnet.mixin.zone',
  Registry: {
    Address: '0x868d8eD8e85B0fa5b60793262690D3863e12C087',
    PID: 'b45dcee0-23d7-4ad1-b51e-c681a257c13e',
  },
  Storage: {
    Address: '0x510a9f1AAbE048912F6536A833ecB6039061e872',
  },
  Refund: {
    Address: '0x07B0bF340765CAE77b734D82EB8d35229796CeBc',
  },
  MVMMembers: [
    'd5a3a450-5619-47af-a3b1-aad08e6e10dd',
    '9d4a18aa-9b0a-40ed-ba57-ce8fbbbc6deb',
    '2f82a56a-7fae-4bdd-bc4d-aad5005c5041',
    'f7f33be1-399a-4d29-b50c-44e5f01cbb1b',
    '23a070df-6b87-4b66-bdd4-f009702770c9',
    '2385639c-eac1-4a38-a7f6-597b3f0f5b59',
    'ab357ad7-8828-4173-b3bb-0600c518eab2'
  ],
  MVMThreshold: 5,
};

export const MVMTestnet = {
  ChainId: 83927,
  RPCUri: 'https://quorum-mayfly-testnet.mixin.zone',
  RPCUriAlpha: 'https://quorum-testnet.mixin.zone',
  Registry: {
    Address: '0xbb0860774b68b4Aaa07ED32fb118dA39e5b18454',
    PID: '119f84c9-9f72-31b5-af71-611de05dace8',
  },
  Storage: {
    Address: '0x510a9f1AAbE048912F6536A833ecB6039061e872',
  },
  Refund: {
    Address: '0x07B0bF340765CAE77b734D82EB8d35229796CeBc',
  },
  MVMMembers: ['a15e0b6d-76ed-4443-b83f-ade9eca2681a', 'b9126674-b07d-49b6-bf4f-48d965b2242b', '15141fe4-1cfd-40f8-9819-71e453054639', '3e72ca0c-1bab-49ad-aa0a-4d8471d375e7'],
  MVMThreshold: 3,
};

export const MVMApiTestURI = 'https://api.test.mvm.dev';
