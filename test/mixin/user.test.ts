import User from '../../src/client/user';
import Pin from '../../src/client/pin';
import keystore from './keystore';

describe('Tests for users', () => {
  const user = User({ keystore });
  test('Test for read user`s profile', async () => {
    const resp = await user.profile();
    expect(resp.user_id).toMatch(keystore.user_id);
    expect(resp.has_pin).toBe(true);
  });

  test('fetch user by id', async () => {
    const resp = await user.fetch(keystore.user_id);
    expect(resp.user_id).toMatch(keystore.user_id);
    expect(resp.is_verified).toBe(false);
    expect(resp.full_name).toMatch('js sdk');
  });

  test('verify user pin', async () => {
    const pin = Pin({ keystore });
    const resp = await pin.verify(keystore.pin!);
    expect(resp.user_id).toMatch(keystore.user_id);
    expect(resp.is_verified).toBe(false);
  });

  test('user update me', async () => {
    const resp = await user.update('js sdk', '');
    expect(resp.full_name).toMatch('js sdk');
  });

  test('test for user rotate code', async () => {
    const resp = await user.rotateCode();
    expect(resp.user_id).toMatch(keystore.user_id);
  });
});
