import Utils from '../../src/newClient/utils';

describe('Tests for utils', () => {
  test('base64 encode & decode should be url safe', () => {
    expect(Utils.base64RawURLEncode(Buffer.from('a'))).toMatch('YQ');
    expect(Utils.base64RawURLEncode(Buffer.from('ab'))).toMatch('YWI');
    expect(Utils.base64RawURLEncode(Buffer.from('abcde'))).toMatch('YWJjZGU');
    expect(Utils.base64RawURLEncode(Buffer.from('abcdefghijklmnopqrstuvwxyz'))).toMatch('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');

    let buf = Utils.base64RawURLDecode('YQ');
    expect(buf.toString()).toMatch('a');
    buf = Utils.base64RawURLDecode('YWI');
    expect(buf.toString()).toMatch('ab');
    buf = Utils.base64RawURLDecode('YWJjZGU');
    expect(buf.toString()).toMatch('abcde');
    buf = Utils.base64RawURLDecode('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo');
    expect(buf.toString()).toMatch('abcdefghijklmnopqrstuvwxyz');
  });
});
