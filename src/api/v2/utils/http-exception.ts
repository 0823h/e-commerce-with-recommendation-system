export class HttpException extends Error {
  public statusCode: number;
  public message: string;

  constructor(message: string, statusCode: number) {
    super();

    this.message = message;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
