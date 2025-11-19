export class FetchError extends Error {
  response: Response;
  request: Request;

  constructor(
    message: string,
    options: {
      response: Response;
      request: Request;
    }
  ) {
    super(message);
    this.name = 'FetchError';
    this.response = options.response;
    this.request = options.request;
  }
}
