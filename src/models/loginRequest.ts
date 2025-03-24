import { ValidationError } from "../errors/Validationerror";
export class LoginRequest {
  constructor(
    public email: string,
    public password: string
  ) {}

  public static fromJson(json: any): LoginRequest {
    if (!json) {
      throw new ValidationError('Invalid login data: No input provided');
    }
    
    if (!json.email) {
      throw new ValidationError('Email is required');
    }
    
    if (!json.password) {
      throw new ValidationError('Password is required');
    }
    return new LoginRequest(json.email, json.password);
  }
}