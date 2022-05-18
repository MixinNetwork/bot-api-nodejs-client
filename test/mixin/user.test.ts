import User from '../../src/newClient/user';
import keystore from './keystore';

describe('Tests for users', () => {
  const user = User({ keystore });
  test('Test for read user`s profile', async () => {
    const resp = await user.profile();
    expect(resp.user_id).toMatch(keystore.user_id);
    expect(resp.has_pin).toBe(true);
  });

  test('fetch user by id', async () =>  {
    const resp = await user.fetch(keystore.user_id);
    expect(resp.user_id).toMatch(keystore.user_id);
  });
});
