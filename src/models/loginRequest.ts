import { ValidationError } from "../errors/Validationerror";
export class LoginRequest {
  constructor(
    public email: string,
    public password: string
  ) {}

  public static fromJson(json: any): LoginRequest {
    if (!json || !json.email || !json.password) {
      throw new ValidationError('Invalid login data: email and password are required');
    }
    return new LoginRequest(json.email, json.password);
  }
}