import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  details?: any;
}



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

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  const details = error.details || null;

  res.status(status).json({
    error: message,
    status,
    details,
  });
};