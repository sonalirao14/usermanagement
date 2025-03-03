import { Request,Response,NextFunction } from "express";
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