import { Document as MongoDocument , ObjectId} from "mongodb";
import { ValidationError } from "../errors/Validationerror";
export class UserRequest implements MongoDocument {
  _id?: ObjectId;

  constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public age: number,
    public password: string
  ) {}

  public static fromJson(json: any): UserRequest {
    if (!json || !json.firstname || !json.email || json.age === undefined || typeof json.age !== 'number' || !json.password) {
      throw new ValidationError('Invalid user data: name, email, age, and password are required, and age must be a number');
    }
    return new UserRequest(json.firstname, json.lastname, json.email, json.age, json.password);
  }
}
