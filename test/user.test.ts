import { client, keystore } from './common';

describe('user', () => {
  it('profile', async () => {
    const user = await client.user.profile();
    expect(user.user_id).toEqual(keystore.app_id);
  });

  it('fetch', async () => {
    const user = await client.user.fetch(keystore.app_id);
    expect(user.user_id).toEqual(keystore.app_id);
  });

  it('readBlockUsers', async () => {
    const user = await client.user.blockings();
    expect(Array.isArray(user)).toBeTruthy();
  });

  it('fetchList', async () => {
    const users = await client.user.fetchList(['e8e8cd79-cd40-4796-8c54-3a13cfe50115']);
    expect(users[0].identity_number).toEqual('30265');
  });

  it('readFriends', async () => {
    const user = await client.user.friends();
    expect(Array.isArray(user)).toBeTruthy();
  });
});
