import { v4 as uuid } from 'uuid';
import type { MixinInvoice } from '../../src/client/types/invoice';
import { signAccessToken } from '../../src/client/utils/auth';
import { base64RawURLEncode, base64RawURLDecode } from '../../src/client/utils/base64';
import { hashMembers, uniqueConversationID } from '../../src/client/utils/uniq';
import { buildMixAddress, parseMixAddress } from '../../src/client/utils/address';
import { attachInvoiceEntry, getInvoiceString, MixinInvoiceVersion, newMixinInvoice, parseMixinInvoice } from '../../src/client/utils/invoice';
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

  test('tests for auth', () => {
    expect(signAccessToken('GET', '/me', '', uuid(), keystore)).not.toBe('');
    expect(signAccessToken('POST', '/me', { foo: 'bar' }, uuid(), keystore)).not.toBe('');
  });

  test('tests for mix address', () => {
    let members = ['67a87828-18f5-46a1-b6cc-c72a97a77c43'];
    let address = buildMixAddress({ members, threshold: 1 });
    expect('MIX3QEeg1WkLrjvjxyMQf6Xc8dxs81tpPc').toBe(address);

    let ma = parseMixAddress('MIX3QEeg1WkLrjvjxyMQf6Xc8dxs81tpPc');
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
    address = buildMixAddress({ members, threshold: 4 });
    expect(
      'MIX4fwusRK88p5GexHWddUQuYJbKMJTAuBvhudgahRXKndvaM8FdPHS2Hgeo7DQxNVoSkKSEDyZeD8TYBhiwiea9PvCzay1A9Vx1C2nugc4iAmhwLGGv4h3GnABeCXHTwWEto9wEe1MWB49jLzy3nuoM81tqE2XnLvUWv',
    ).toBe(address);
    ma = parseMixAddress(
      'MIX4fwusRK88p5GexHWddUQuYJbKMJTAuBvhudgahRXKndvaM8FdPHS2Hgeo7DQxNVoSkKSEDyZeD8TYBhiwiea9PvCzay1A9Vx1C2nugc4iAmhwLGGv4h3GnABeCXHTwWEto9wEe1MWB49jLzy3nuoM81tqE2XnLvUWv',
    );
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(4);

    members = ['XIN3BMNy9pQyj5XWDJtTbaBVE2zQ66zBo2weyc43iL286asdqwApWswAzQC5qba26fh3fzHK9iMoxyx1q3Lgj45KJftzGD9q'];
    address = buildMixAddress({ members, threshold: 1 });
    expect('MIXPYWwhjxKsbFRzAP2Dcb2mMjj7sQQo4MpCSv3NYaYCdQ2kEcbcimpPT81gaxtuNhunLWPx7Sv7fawjZ8DhRmEj8E2hrQM4Z6e').toBe(address);
    ma = parseMixAddress('MIXPYWwhjxKsbFRzAP2Dcb2mMjj7sQQo4MpCSv3NYaYCdQ2kEcbcimpPT81gaxtuNhunLWPx7Sv7fawjZ8DhRmEj8E2hrQM4Z6e');
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(1);

    members = [
      'XINGNzunRUMmKGqDhnf1MT8tR7ek6ozg2V6dXFHCCg3tndnSRcAdzET8Fw4ktcQKshzteDmyV2RE8aFiKPz8ewrvsj3s7fvC',
      'XINMd9kCbxEoEetZuDM8gGJS11X3TVrRLwzhnqgMr65qjJBkCncNqSAngESpC7Hddnsw1D9Jo2QJakbFPr8WyrM6VkskGkB8',
      'XINLM7VuMYSjvKiEQPyLpaG7NDLDPngWWFBZpVJjhGamMsgPbmeSsGs3fQzNoqSr6syBTyLM3i69T7iSN8Tru7aQadiKLkSV',
    ];
    address = buildMixAddress({ members, threshold: 2 });
    expect(
      'MIXBCirWksVv9nuphqbtNRZZvwKsXHHMUnB5hVrVY1P7f4eBdLpDoLwiQoHYPvXia2wFepnX6hJwTjHybzBiroWVEMaFHeRFfLpcU244tzRM8smak9iRAD4PJRHN1MLHRWFtErottp9t7piaRVZBzsQXpSsaSgagj93voQdUuXhuQGZNj3Fme5YYMHfJBWjoRFHis4mnhBgxkyEGRUHAVYnfej2FhrypJmMDu74irRTdj2xjQYr6ovBJSUBYDBcvAyLPE3cEKc4JsPz7b9',
    ).toBe(address);
    ma = parseMixAddress(
      'MIXBCirWksVv9nuphqbtNRZZvwKsXHHMUnB5hVrVY1P7f4eBdLpDoLwiQoHYPvXia2wFepnX6hJwTjHybzBiroWVEMaFHeRFfLpcU244tzRM8smak9iRAD4PJRHN1MLHRWFtErottp9t7piaRVZBzsQXpSsaSgagj93voQdUuXhuQGZNj3Fme5YYMHfJBWjoRFHis4mnhBgxkyEGRUHAVYnfej2FhrypJmMDu74irRTdj2xjQYr6ovBJSUBYDBcvAyLPE3cEKc4JsPz7b9',
    );
    expect(ma).not.toBe(undefined);
    expect(ma!.members.join(',')).toBe(members.join(','));
    expect(ma!.threshold).toBe(2);
  });

  test('tests for invoice', () => {
    const BTC = 'c6d0c728-2624-429b-8e0d-d9d19b6592fa';
    const ETH = '43d61dcd-e413-450d-80b8-101d5e903357';

    const recipient =
      'MIX4fwusRK88p5GexHWddUQuYJbKMJTAuBvhudgahRXKndvaM8FdPHS2Hgeo7DQxNVoSkKSEDyZeD8TYBhiwiea9PvCzay1A9Vx1C2nugc4iAmhwLGGv4h3GnABeCXHTwWEto9wEe1MWB49jLzy3nuoM81tqE2XnLvUWv';
    let mi = newMixinInvoice(recipient);
    expect(mi).not.toBeUndefined();

    const trace1 = '772e6bef-3bff-4fcc-987d-29bafca74d63';
    const amt1 = '0.12345678';
    const ref1 = '7ecf9fc49ff4d2e36424b8e53e67aed8cc4e9d08d7cbdca7d8bdb153ed2fcdde';
    attachInvoiceEntry(mi as MixinInvoice, {
      trace_id: trace1,
      asset_id: BTC,
      amount: amt1,
      extra: Buffer.from('extra one'),
      index_references: [],
      hash_references: [ref1],
    });

    const trace2 = '3552d116-b29d-4d72-9b24-3ca3b2e0f9c2';
    const amt2 = '0.23345678';
    const ref2 = '4a5f79c76872524c6a4a81b174338584e790f09fb059c39cf2a894de1b3c31c6';
    attachInvoiceEntry(mi as MixinInvoice, {
      trace_id: trace2,
      asset_id: ETH,
      amount: amt2,
      extra: Buffer.from('extra two'),
      index_references: [0],
      hash_references: [ref2],
    });

    const str = getInvoiceString(mi as MixinInvoice);
    expect(str).toEqual(
      'MINAABzAgQHZ6h4KBj1RqG2zMcql6d8Q8lKyI9GcTl2tgoJBk8YEejG0McoJiRCm44N2dGbZZL6Z6h4KBj1RqG2zMcql6d8Q8lKyI9GcTl2tgoJBk8YEejG0McoJiRCm44N2dGbZZL6Z6h4KBj1RqG2zMcql6d8QwJ3LmvvO_9PzJh9Kbr8p01jxtDHKCYkQpuODdnRm2WS-gowLjEyMzQ1Njc4AAlleHRyYSBvbmUBAH7Pn8Sf9NLjZCS45T5nrtjMTp0I18vcp9i9sVPtL83eNVLRFrKdTXKbJDyjsuD5wkPWHc3kE0UNgLgQHV6QM1cKMC4yMzM0NTY3OAAJZXh0cmEgdHdvAgEAAEpfecdoclJMakqBsXQzhYTnkPCfsFnDnPKolN4bPDHGTTpvYA',
    );

    mi = parseMixinInvoice(str);
    expect(mi).not.toBeUndefined();
    mi = mi as MixinInvoice;
    expect(mi.version).toEqual(MixinInvoiceVersion);
    expect(buildMixAddress(mi.recipient)).toEqual(recipient);
    expect(mi.entries).toHaveLength(2);

    const e1 = mi.entries[0];
    expect(e1.trace_id).toEqual(trace1);
    expect(e1.asset_id).toEqual(BTC);
    expect(e1.amount).toEqual(amt1);
    expect(e1.extra).toEqual(Buffer.from('extra one'));
    expect(e1.index_references).toHaveLength(0);
    expect(e1.hash_references).toHaveLength(1);
    expect(e1.hash_references[0]).toEqual(ref1);

    const e2 = mi.entries[1];
    expect(e2.trace_id).toEqual(trace2);
    expect(e2.asset_id).toEqual(ETH);
    expect(e2.amount).toEqual(amt2);
    expect(e2.extra).toEqual(Buffer.from('extra two'));
    expect(e2.index_references).toHaveLength(1);
    expect(e2.index_references[0]).toEqual(0);
    expect(e2.hash_references).toHaveLength(1);
    expect(e2.hash_references[0]).toEqual(ref2);
  });
});
