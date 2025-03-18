export class NotFoundError extends Error {
    constructor(message: string, public details?: any) {
      super(message);
      this.name = 'NotFoundError';
      this.status = 404;
      this.details = details;
    }
  
    status: number;
  }