import { ValidationError } from "../errors/Validationerror";
export class UpdateUserRequest {
    _id?: string | any;
  constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public age: number
  ) {}
    public static fromJson(json: any): UpdateUserRequest {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const errors: string[] = [];
      
      if (!json) {
        throw new ValidationError('Invalid data: No input provided');
      }
  
      if (!json.firstname) {
        errors.push('Firstname is required');
      }
  
      if (!json.lastname) {
        errors.push('Lastname is required');
      }
  
      if (!json.email) {
        errors.push('Email is required');
      }
  
      if (!json.age) {
        errors.push('Age is required');
      }
  
      if (typeof json.age !== 'number') {
        errors.push('Age must be a number');
      }
  
      if (!json.email || !emailRegex.test(json.email)) {
        errors.push('Email format is invalid');
      }
  
    
      if (errors.length > 0) {
        throw new ValidationError(errors.join(' '));
      }

      return new UpdateUserRequest(
        json.firstname,
        json.lastname,
        json.email,
        json.age
      );
    }
  }
  