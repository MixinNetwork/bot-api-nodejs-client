import { client, app_pin } from './common';

describe('address', () => {
  const asset_id = '43d61dcd-e413-450d-80b8-101d5e903357';
  const destination = '0xF2e6D6BB9E6D31B873bC23649A25A76f8852e3f5';
  let tmpAddressID = '';

  it('create address if not exsits', async () => {
    const receive = await client.address.create(app_pin, { asset_id, destination, label: 'test' });
    console.log(receive);
    const res = await client.address.fetch(receive.address_id);
    expect(res.address_id).toEqual(receive.address_id);
    tmpAddressID = receive.address_id;
  });
  it('read addresses', async () => {
    const list = await client.address.fetchListOfChain(asset_id);
    const isHave = list.some(item => item.address_id === tmpAddressID);
    expect(isHave).toBeTruthy();
  });
  it('delete address', async () => {
    const res = await client.address.fetch(tmpAddressID);
    expect(res.address_id).toEqual(tmpAddressID);
    const t = await client.address.delete(app_pin, tmpAddressID);
    expect(t).toBeUndefined();
  });
});
