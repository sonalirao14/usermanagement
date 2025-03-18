export class DuplicateKeyError extends Error {
    constructor(message: string, public details?: any) {
      super(message);
      this.name = 'DuplicateKeyError';
      this.status = 409;
      this.details = details;
    }
  
    status: number;
  }