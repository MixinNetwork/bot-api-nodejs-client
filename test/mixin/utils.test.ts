import Utils from '../../src/newClient/utils';

describe('Tests for utils', () => {
  test('base64 encode & decode should be url safe', () => {
    // buffer to base64
    expect(Utils.base64RawURLEncode(Buffer.from('a'))).toMatch('YQ');
    expect(Utils.base64RawURLEncode(Buffer.from('ab'))).toMatch('YWI');
    expect(Utils.base64RawURLEncode(Buffer.from('abcde'))).toMatch('YWJjZGU');
    expect(Utils.base64RawURLEncode(Buffer.from('abcdefghijklmnopqrstuvwxyz'))).toMatch('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');

    // string to base64
    expect(Utils.base64RawURLEncode('abcdefghijklmnopqrstuvwxyz')).toMatch('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');

    // empty string to base64
    expect(Utils.base64RawURLEncode('')).toMatch('');

    // base64 string to buffer
    let buf = Utils.base64RawURLDecode('YQ');
    expect(buf.toString()).toMatch('a');
    buf = Utils.base64RawURLDecode('YWI');
    expect(buf.toString()).toMatch('ab');
    buf = Utils.base64RawURLDecode('YWJjZGU');
    expect(buf.toString()).toMatch('abcde');
    buf = Utils.base64RawURLDecode('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');
    expect(buf.toString()).toMatch('abcdefghijklmnopqrstuvwxyz');

    // base64 buffer to string
    buf = Utils.base64RawURLDecode(Buffer.from('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo'));
    expect(buf.toString()).toMatch('abcdefghijklmnopqrstuvwxyz');
  });

  test('tests for hashMembers', () => {
    let hash = Utils.hashMembers(['965e5c6e-434c-3fa9-b780-c50f43cd955c']);
    expect(hash).toBe('b9f49cf777dc4d03bc54cd1367eebca319f8603ea1ce18910d09e2c540c630d8');
    hash = Utils.hashMembers(['965e5c6e-434c-3fa9-b780-c50f43cd955c', 'd1e9ec7e-199d-4578-91a0-a69d9a7ba048']);
    expect(hash).toBe('6064ec68a229a7d2fe2be652d11477f21705a742e08b75564fd085650f1deaeb');
  });
});
