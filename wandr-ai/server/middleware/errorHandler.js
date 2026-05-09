import * as Sentry from '@sentry/node';

export const errorHandler = (err, req, res, next) => {
  // Capture exception in Sentry
  Sentry.captureException(err);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;

    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
      const message = `Resource not found. Invalid: ${error.path}`;
      error.statusCode = 400;
      error.message = message;
    }

    // Mongoose duplicate key
    if (error.code === 11000) {
      const message = `Duplicate field value entered`;
      error.statusCode = 409;
      error.message = message;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      error.statusCode = 400;
      error.message = message.join(', ');
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      const message = 'Invalid token. Please log in again!';
      error.statusCode = 401;
      error.message = message;
    }

    if (error.name === 'TokenExpiredError') {
      const message = 'Your token has expired! Please log in again.';
      error.statusCode = 401;
      error.message = message;
    }

    // Operational, trusted error: send message to client
    if (error.isOperational || error.statusCode !== 500) {
      res.status(error.statusCode || 400).json({
        status: error.status || 'error',
        message: error.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error('ERROR 💥', error);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};
