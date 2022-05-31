import { ResponseError } from '../../src/newClient/error';

describe('Tests for ResponseError', () => {
  test('Test response error', () => {
    const id = '0f321425-ab1d-4a41-a177-efaa08160df5';
    const err = new ResponseError(100, 'description', 201, {reason: 'invalid'}, id, '');
    expect(err.code).toEqual(100);
    expect(err.requestId).toMatch(id);
  });
});
