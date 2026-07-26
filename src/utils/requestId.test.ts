import { newRequestId, REQUEST_ID_HEADER } from './requestId';

test('REQUEST_ID_HEADER is the X-Request-ID header name', () => {
  expect(REQUEST_ID_HEADER).toBe('X-Request-ID');
});

test('newRequestId returns a non-empty, unique id per call', () => {
  const first = newRequestId();
  const second = newRequestId();

  expect(first).toBeTruthy();
  expect(second).toBeTruthy();
  expect(first).not.toBe(second);
});
