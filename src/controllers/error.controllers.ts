import { NextFunction, Request, Response } from 'express';
import { HttpStatusCodes, NodeEnvironments } from '@/constants/index.js';
import AppError from '@/utils/app-error.utils.js';
import colors from 'colors';

const handleDuplicateFieldsError = (err: AppError) => {
  const message = `Duplicate field value: {${err.meta.target[0]}}. Please use another value!`;
  return new AppError(message, HttpStatusCodes.BAD_REQUEST);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    error: err,
    stack: err.stack,
    status: err.status,
    message: err.message || 'An unexpected error occurred',
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || 'An unexpected error occurred',
    });
  } else {
    // For programming or unknown errors, don't leak error details to the client
    console.error(colors.bgRed.bold('ERROR 💥'), err);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export default function GlobalErrorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  err.statusCode = err.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === NodeEnvironments.DEVELOPMENT) {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === NodeEnvironments.PRODUCTION) {
    let error = { ...err };

    if (error.code === 'P2002') error = handleDuplicateFieldsError(error);

    sendErrorProd(error, res);
  }
}
