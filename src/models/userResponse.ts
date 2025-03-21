// import { Document as MongoDocument , ObjectId} from "mongodb";
export class UserResponse {
  _id?: String|any;

  constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public email: string,
    public age: number,
    public hashedPassword: string
  ) {}
}