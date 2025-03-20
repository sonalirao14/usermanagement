export class ValidationError extends Error {
    constructor(message: string, public details?: any) {
      super(message);
      this.name = 'ValidationError';
      this.status = 400;
      this.details = details;
    }
  
    status: number;
  }