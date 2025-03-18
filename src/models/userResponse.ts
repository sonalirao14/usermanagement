import { Document as MongoDocument , ObjectId} from "mongodb";
export class UserResponse implements MongoDocument {
  _id?: ObjectId;

  constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public email: string,
    public age: number,
    public hashedPassword: string
  ) {}
}