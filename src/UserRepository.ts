import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { DependencyKeys } from './constant';
import { IDatabase } from '../src/contracts/IDataBase';
import { UserRequest, UserResponse, DatabaseError } from '../src/models/UserModel';
import { IUserRepository } from './contracts/IUserRepository';

@injectable()
export class UserRepository implements IUserRepository{
  private db: IDatabase;

  constructor(@inject(DependencyKeys.DatabaseAccess) db: IDatabase){
    this.db=db;
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse>{
    try{
      const collection=this.db.getCollection('users');
      const result=await collection.insertOne(user);
      return new UserResponse(result.insertedId.toString(), user.firstname, user.lastname,user.course, user.email, user.age);
    }catch(e){
      throw new DatabaseError('Failed to add user to database', e);
    }
  }

  async getUserAsync(id: string): Promise<UserResponse|null>{
    try{
      const collection=this.db.getCollection('users');
      const user=await collection.findOne({_id: new ObjectId(id)});
      if (!user) {
        return null;
      }
      return new UserResponse(id, user.firstname, user.lastname, user.course, user.email, user.age);
    }catch(e){
      throw new DatabaseError(`Failed to fetch user with ID ${id}`,e);
    }
  }

  async getAllAsync(): Promise<UserResponse[]>{
    try{
      const collection= this.db.getCollection('users');
      const users= await collection.find().toArray();
      return users.map(user=> new UserResponse(user._id.toString(), user.firstname,user.lastname,user.course, user.email, user.age));
    }catch(e){
      throw new DatabaseError('Failed to fetch all users',e);
    }
  }

  async updateUserAsync(id: string, user: UserRequest): Promise<boolean>{
    try {
      const collection= this.db.getCollection('users');
      const result=await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: user }
      );
      return result.modifiedCount > 0;
    }catch(e){
      throw new DatabaseError(`Failed to update user with ID ${id}`, e  );
    }
  }

  async deleteUserAsync(id: string): Promise<boolean>{
    try{
      const collection=this.db.getCollection('users');
      const result=await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }catch(e){
      throw new DatabaseError(`Failed to delete user with ID ${id}`, e);
    }
  }
}