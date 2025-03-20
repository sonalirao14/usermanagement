// import { Document as MongoDocument , ObjectId} from "mongodb";
import { ValidationError } from "../errors/Validationerror";
import { PasswordValidator, ErrorInterface } from "password-validator-pro";
const validator = new PasswordValidator({
  minLength: 8,                // Minimum length of the password
  maxLength: 20,               // Maximum length of the password
  requireUppercase: true,      // Require at least one uppercase letter
  requireLowercase: true,      // Require at least one lowercase letter
  requireNumbers: true,        // Require at least one number
  requireSpecialChars: true,   // Require at least one special character
  combineErrors: false,        // Set this to false so we can list errors separately
});
export class UserRequest {
  _id?: String | any;
  constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public age: number,
    public password: string
  ) {}
   
  public static fromJson(json: any): UserRequest {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const errors: string[] = [];
    if (!json || !json.firstname || !json.email || json.age === undefined || typeof json.age !== 'number' || !json.password) {
      throw new ValidationError('Invalid user data: name, email, age, and password are required, and age must be a number');
    }
    if (!emailRegex.test(json.email)) {
      errors.push("Email format is invalid");
    }
    const passwordValidation = validator.validate(json.password);
    if (!passwordValidation.valid) {
      const passwordErrors: ErrorInterface[] = passwordValidation.errors;
      errors.push(...passwordErrors.map(error => error.message));
    }

   if(errors.length>0){
    throw new ValidationError(errors.join(" "));
   }
    return new UserRequest(json.firstname, json.lastname, json.email, json.age, json.password);
  }
}
