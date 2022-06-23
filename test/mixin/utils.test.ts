// @ts-ignore
import forge from 'node-forge';
import { v4 as uuid } from 'uuid';
import { signAuthenticationToken } from '../../src/client/utils/auth';
import { base64RawURLEncode, base64RawURLDecode } from '../../src/client/utils/base64';
import { hashMembers, uniqueConversationID } from '../../src/client/utils/uniq';
import { sharedEd25519Key, signEd25519PIN } from '../../src/client/utils/pin';
import keystore from '../keystore';

describe('Tests for utils', () => {
  test('base64 encode & decode should be url safe', () => {
    // buffer to base64
    expect(base64RawURLEncode(Buffer.from('a'))).toMatch('YQ');
    expect(base64RawURLEncode(Buffer.from('ab'))).toMatch('YWI');
    expect(base64RawURLEncode(Buffer.from('abcde'))).toMatch('YWJjZGU');
    expect(base64RawURLEncode(Buffer.from('abcdefghijklmnopqrstuvwxyz'))).toMatch('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');

    // string to base64
    expect(base64RawURLEncode('abcdefghijklmnopqrstuvwxyz')).toMatch('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');

    // empty string to base64
    expect(base64RawURLEncode('')).toMatch('');

    // base64 string to buffer
    let buf = base64RawURLDecode('YQ');
    expect(buf.toString()).toMatch('a');
    buf = base64RawURLDecode('YWI');
    expect(buf.toString()).toMatch('ab');
    buf = base64RawURLDecode('YWJjZGU');
    expect(buf.toString()).toMatch('abcde');
    buf = base64RawURLDecode('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');
    expect(buf.toString()).toMatch('abcdefghijklmnopqrstuvwxyz');

    // base64 buffer to string
    buf = base64RawURLDecode(Buffer.from('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo'));
    expect(buf.toString()).toMatch('abcdefghijklmnopqrstuvwxyz');
  });

  test('tests for hashMembers', () => {
    let hash = hashMembers(['965e5c6e-434c-3fa9-b780-c50f43cd955c']);
    expect(hash).toBe('b9f49cf777dc4d03bc54cd1367eebca319f8603ea1ce18910d09e2c540c630d8');
    const ids = ['965e5c6e-434c-3fa9-b780-c50f43cd955c', 'd1e9ec7e-199d-4578-91a0-a69d9a7ba048'];
    hash = hashMembers(ids);
    expect(hash).toBe('6064ec68a229a7d2fe2be652d11477f21705a742e08b75564fd085650f1deaeb');
    const reverseIds = ['d1e9ec7e-199d-4578-91a0-a69d9a7ba048', '965e5c6e-434c-3fa9-b780-c50f43cd955c'];
    hash = hashMembers(reverseIds);
    expect(hash).toBe('6064ec68a229a7d2fe2be652d11477f21705a742e08b75564fd085650f1deaeb');

    // forge sha256 is not equal to jssha
    const key = ids.sort().join('');
    const md = forge.md.sha256.create();
    md.update(key, 'utf8');
    expect(md.digest().toHex()).toBe('cc24bdf9c9c6a9d96031568e66a6c56f800ac4fefc88061e4aea6ed0df5ac41a');
    const md1 = forge.md.sha512.create();
    md1.update(key);
    expect(md1.digest().toHex()).toBe('496c8f01925653803104c38b313068d4eb79d840c6ed9aa9576f896e71a0c6dad2ccc2634219339b90fffc7117fa7032f343200e1511805c8a4267b5f26a0ff5');
  });

  test('tests for uniqueConversationID', () => {
    expect(uniqueConversationID('965e5c6e-434c-3fa9-b780-c50f43cd955c', 'd1e9ec7e-199d-4578-91a0-a69d9a7ba048')).toMatch('60478c27-1052-3df5-b938-b96a8b907e76');
    expect(uniqueConversationID('d1e9ec7e-199d-4578-91a0-a69d9a7ba048', '965e5c6e-434c-3fa9-b780-c50f43cd955c')).toMatch('60478c27-1052-3df5-b938-b96a8b907e76');
  });

  test('tests for encrypte pin', () => {
    const privateBob: string = 'ecbda951581271c5fd644871e63149561291d88bfc4bcff2afe42d522b71d2df';
    const pubBob: string = '27b190c953fca478ec2b8ec32d5181bd9e1b8c345662ff66f020a039e6376947';
    const privateAlice: string = 'a340e8e294fae1cc3e3b3fb56633d21f6eefb5591ac62aa32bede494c36a3fb0';
    const pubAlice: string = '4056be9513f09744aa3d8d5ded5a6e885dd054aff226e6b31a701504b031474b';

    const share1 = sharedEd25519Key(Buffer.from(pubAlice, 'hex').toString('base64'), Buffer.from(privateBob, 'hex').toString('base64'));
    const share2 = sharedEd25519Key(Buffer.from(pubBob, 'hex').toString('base64'), Buffer.from(privateAlice, 'hex').toString('base64'));
    expect(Buffer.from(share1).toString('hex')).toBe(Buffer.from(share2).toString('hex'));

    expect(signEd25519PIN('123456', undefined)).toBe('');
    expect(signEd25519PIN('123456', keystore)).not.toBe('');
  });

  test('tests for auth', () => {
    expect(signAuthenticationToken('GET', '/me', '', uuid(), keystore)).not.toBe('');
    expect(signAuthenticationToken('POST', '/me', {foo: 'bar'}, uuid(), keystore)).not.toBe('');
  });
});
