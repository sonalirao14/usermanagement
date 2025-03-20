export class DatabaseError extends Error {
    constructor(message: string, public details?: any) {
      super(message);
      this.name = 'DatabaseError';
      this.status = 500;
      this.details = details;
    }
  
    status: number;
  }