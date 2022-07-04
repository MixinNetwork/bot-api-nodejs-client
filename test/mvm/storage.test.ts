import { keccak256 } from 'ethers/lib/utils';
import { getExtra, MixinStorage } from '../../src';

describe('Tests for Storage Contract', () => {
  const contractReadCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'count', // contract function
  };
  const contractAddAnyCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'addAny', // contract function
    types: ['uint256'], // function parameters type array
    values: [2], // function parameters value array
  };
  const contractAddOneCount = {
    address: '0x2E8f70631208A2EcFC6FA47Baf3Fde649963baC7', // contract address
    method: 'addOne', // contract function
  };
  // contracts array
  const contracts = [
    contractReadCount,
    contractAddOneCount,
    contractReadCount,
    contractAddAnyCount,
    contractReadCount,
  ];

  const extra = getExtra(contracts);
  const key = keccak256(extra);

  test('Test for read', async () => {
    const storage = new MixinStorage();
    const storageValue = await storage.readValue(key);

    expect(storageValue).toEqual(extra);
  });
});
