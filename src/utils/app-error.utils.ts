class AppError extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;
  meta: Record<string, string | string[]>;
  code?: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.meta = {};
    this.isOperational = true;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
