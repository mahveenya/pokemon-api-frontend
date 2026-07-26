export const REQUEST_ID_HEADER = 'X-Request-ID';

export const newRequestId = (): string => crypto.randomUUID();
