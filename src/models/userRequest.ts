// import { Document as MongoDocument , ObjectId} from "mongodb";
import { ValidationError } from "../errors/Validationerror";
import { PasswordValidator, ErrorInterface } from "password-validator-pro";
const validator = new PasswordValidator({
  minLength: 8,                
  maxLength: 20,               
  requireUppercase: true,      
  requireLowercase: true,      
  requireNumbers: true,        
  requireSpecialChars: true,   
  combineErrors: false,        
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
    if (!json) {
      throw new ValidationError('Invalid data: No input provided');
    }
    
    if (!json.firstname) {
      throw new ValidationError('Firstname is required');
    }
    
    if (!json.email) {
      throw new ValidationError('Email is required');
    }
    
    if (json.age === undefined) {
      throw new ValidationError('Age is required');
    }
    
    if (typeof json.age !== 'number') {
      throw new ValidationError('Age must be a number');
    }
    
    if (!json.password) {
      throw new ValidationError('Password is required');
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
