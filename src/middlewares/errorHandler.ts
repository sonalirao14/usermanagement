import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  details?: any;
}

// Middleware to log request details
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log the incoming request
  console.log(`[${timestamp}] ${req.method} ${req.url} - Request received`);

  // Hook into the response's finish event to log the response status
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${req.url} - Response sent: ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  // Detailed logging with timestamp, request details, and error stack
  console.error(`[${timestamp}] Error occurred:`, {
    method: req.method,
    url: req.url,
    errorMessage: error.message,
    errorName: error.name,
    status: error.status || 500,
    details: error.details || null,
    stack: error.stack,
  });

  // Default status code and message
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  const details = error.details || null;

  // Send a consistent error response
  res.status(status).json({
    error: message,
    status,
    details,
  });
};