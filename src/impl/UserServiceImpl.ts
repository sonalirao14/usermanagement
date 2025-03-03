// import { injectable, inject } from 'inversify';
// import { IUserService } from '../contracts/IUserService';
// import { IDatabase } from '../contracts/IDataBase';
// import { DependencyKeys } from '../constant';
// import { UserRequest, UserResponse } from '../models/UserModel';
// import { ObjectId } from 'mongodb';

// @injectable()
// export class UserServiceImpl implements IUserService {
//   private db: IDatabase;

//   constructor(@inject(DependencyKeys.DatabaseAccess) db: IDatabase) {
//     this.db = db;
//   }

//   async createUser(user: UserRequest): Promise<UserResponse> {
//     const collection = this.db.getCollection('users');
//     const result = await collection.insertOne(user);
//     return new UserResponse(result.insertedId.toString(),user.firstname,user.lastname,user.course,user.email,user.age);
//   }

//   async getUser(id: string): Promise<UserResponse | null> {
//     const collection = this.db.getCollection('users');
//     const user = await collection.findOne({ _id: new ObjectId(id) });
//     if (!user) return null;
//     return new UserResponse(id,user.firstname,user.lastname,user.course,user.email,user.age);
//   }

//   async getAll(): Promise<UserResponse[]> {
//     const collection = this.db.getCollection('users');
//     const users = await collection.find().toArray();
//     return users.map(user=>new UserResponse(user._id.toString(),user.firstname,user.lastname,user.course,user.email,user.age));
//   }

//   async updateUser(id: string, user: UserRequest): Promise<boolean> {
//     const collection = this.db.getCollection('users');
//     const result = await collection.updateOne(
//       {_id: new ObjectId(id)},
//       {$set:user}
//     );
//     return result.modifiedCount > 0;
//   }

//   async deleteUser(id: string): Promise<boolean> {
//     const collection=this.db.getCollection('users');
//     const result=await collection.deleteOne({_id:new ObjectId(id)});
//     return result.deletedCount>0;
//   }
// }


import { injectable, inject } from 'inversify';
import { DependencyKeys } from '../constant';
import { IUserService } from '../contracts/IUserService';
import { IUserRepository } from '../contracts/IUserRepository';
import { UserRequest, UserResponse } from '../models/UserModel';

@injectable()
export class UserServiceImpl implements IUserService {
  private userRepository: IUserRepository;

  constructor(@inject(DependencyKeys.UserRepository) userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse> {
    return await this.userRepository.createUserAsync(user);
  }

  async getUserAsync(id: string): Promise<UserResponse | null> {
    return await this.userRepository.getUserAsync(id);
  }

  async getAllAsync(): Promise<UserResponse[]> {
    return await this.userRepository.getAllAsync();
  }

  async updateUserAsync(id: string, user: UserRequest): Promise<boolean> {
    return await this.userRepository.updateUserAsync(id, user);
  }

  async deleteUserAsync(id: string): Promise<boolean> {
    return await this.userRepository.deleteUserAsync(id);
  }
}