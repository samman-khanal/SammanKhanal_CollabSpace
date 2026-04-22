export class AppError extends Error {

  constructor(message, statusCode = 500, meta) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (meta) {
      this.meta = meta;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
