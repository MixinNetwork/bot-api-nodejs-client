import { v4 as uuid } from 'uuid';
import { signAccessToken } from '../../src/client/utils/auth';
import { base64RawURLEncode, base64RawURLDecode } from '../../src/client/utils/base64';
import { hashMembers, uniqueConversationID } from '../../src/client/utils/uniq';
import { sharedEd25519Key, signEd25519PIN } from '../../src/client/utils/pin';
import { GetMixAddress, MixAddressFromString } from '../../src/client/utils/address';
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
    expect(signAccessToken('GET', '/me', '', uuid(), keystore)).not.toBe('');
    expect(signAccessToken('POST', '/me', { foo: 'bar' }, uuid(), keystore)).not.toBe('');
  });

  test('tests for mix address', () => {
    let members = ['67a87828-18f5-46a1-b6cc-c72a97a77c43'];
    let address = GetMixAddress({ members, threshold: 1 });
    expect('MIX3QEeg1WkLrjvjxyMQf6Xc8dxs81tpPc').toBe(address);

    let ma = MixAddressFromString('MIX3QEeg1WkLrjvjxyMQf6Xc8dxs81tpPc');
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(1);

    members = [
      '67a87828-18f5-46a1-b6cc-c72a97a77c43',
      'c94ac88f-4671-3976-b60a-09064f1811e8',
      'c6d0c728-2624-429b-8e0d-d9d19b6592fa',
      '67a87828-18f5-46a1-b6cc-c72a97a77c43',
      'c94ac88f-4671-3976-b60a-09064f1811e8',
      'c6d0c728-2624-429b-8e0d-d9d19b6592fa',
      '67a87828-18f5-46a1-b6cc-c72a97a77c43',
    ];
    address = GetMixAddress({ members, threshold: 4 });
    expect(
      'MIX4fwusRK88p5GexHWddUQuYJbKMJTAuBvhudgahRXKndvaM8FdPHS2Hgeo7DQxNVoSkKSEDyZeD8TYBhiwiea9PvCzay1A9Vx1C2nugc4iAmhwLGGv4h3GnABeCXHTwWEto9wEe1MWB49jLzy3nuoM81tqE2XnLvUWv',
    ).toBe(address);
    ma = MixAddressFromString(
      'MIX4fwusRK88p5GexHWddUQuYJbKMJTAuBvhudgahRXKndvaM8FdPHS2Hgeo7DQxNVoSkKSEDyZeD8TYBhiwiea9PvCzay1A9Vx1C2nugc4iAmhwLGGv4h3GnABeCXHTwWEto9wEe1MWB49jLzy3nuoM81tqE2XnLvUWv',
    );
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(4);

    members = ['XIN3BMNy9pQyj5XWDJtTbaBVE2zQ66zBo2weyc43iL286asdqwApWswAzQC5qba26fh3fzHK9iMoxyx1q3Lgj45KJftzGD9q'];
    address = GetMixAddress({ members, threshold: 1 });
    expect('MIXPYWwhjxKsbFRzAP2Dcb2mMjj7sQQo4MpCSv3NYaYCdQ2kEcbcimpPT81gaxtuNhunLWPx7Sv7fawjZ8DhRmEj8E2hrQM4Z6e').toBe(address);
    ma = MixAddressFromString('MIXPYWwhjxKsbFRzAP2Dcb2mMjj7sQQo4MpCSv3NYaYCdQ2kEcbcimpPT81gaxtuNhunLWPx7Sv7fawjZ8DhRmEj8E2hrQM4Z6e');
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(1);

    members = [
      'XINGNzunRUMmKGqDhnf1MT8tR7ek6ozg2V6dXFHCCg3tndnSRcAdzET8Fw4ktcQKshzteDmyV2RE8aFiKPz8ewrvsj3s7fvC',
      'XINMd9kCbxEoEetZuDM8gGJS11X3TVrRLwzhnqgMr65qjJBkCncNqSAngESpC7Hddnsw1D9Jo2QJakbFPr8WyrM6VkskGkB8',
      'XINLM7VuMYSjvKiEQPyLpaG7NDLDPngWWFBZpVJjhGamMsgPbmeSsGs3fQzNoqSr6syBTyLM3i69T7iSN8Tru7aQadiKLkSV',
    ];
    address = GetMixAddress({ members, threshold: 2 });
    expect(
      'MIXBCirWksVv9nuphqbtNRZZvwKsXHHMUnB5hVrVY1P7f4eBdLpDoLwiQoHYPvXia2wFepnX6hJwTjHybzBiroWVEMaFHeRFfLpcU244tzRM8smak9iRAD4PJRHN1MLHRWFtErottp9t7piaRVZBzsQXpSsaSgagj93voQdUuXhuQGZNj3Fme5YYMHfJBWjoRFHis4mnhBgxkyEGRUHAVYnfej2FhrypJmMDu74irRTdj2xjQYr6ovBJSUBYDBcvAyLPE3cEKc4JsPz7b9',
    ).toBe(address);
    ma = MixAddressFromString(
      'MIXBCirWksVv9nuphqbtNRZZvwKsXHHMUnB5hVrVY1P7f4eBdLpDoLwiQoHYPvXia2wFepnX6hJwTjHybzBiroWVEMaFHeRFfLpcU244tzRM8smak9iRAD4PJRHN1MLHRWFtErottp9t7piaRVZBzsQXpSsaSgagj93voQdUuXhuQGZNj3Fme5YYMHfJBWjoRFHis4mnhBgxkyEGRUHAVYnfej2FhrypJmMDu74irRTdj2xjQYr6ovBJSUBYDBcvAyLPE3cEKc4JsPz7b9',
    );
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(2);
  });
});
