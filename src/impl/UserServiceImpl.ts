// // import { injectable, inject } from 'inversify';
// // import { IUserService } from '../contracts/IUserService';
// // import { IDatabase } from '../contracts/IDataBase';
// // import { DependencyKeys } from '../constant';
// // import { UserRequest, UserResponse } from '../models/UserModel';
// // import { ObjectId } from 'mongodb';

// // @injectable()
// // export class UserServiceImpl implements IUserService {
// //   private db: IDatabase;

// //   constructor(@inject(DependencyKeys.DatabaseAccess) db: IDatabase) {
// //     this.db = db;
// //   }

// //   async createUser(user: UserRequest): Promise<UserResponse> {
// //     const collection = this.db.getCollection('users');
// //     const result = await collection.insertOne(user);
// //     return new UserResponse(result.insertedId.toString(),user.firstname,user.lastname,user.course,user.email,user.age);
// //   }

// //   async getUser(id: string): Promise<UserResponse | null> {
// //     const collection = this.db.getCollection('users');
// //     const user = await collection.findOne({ _id: new ObjectId(id) });
// //     if (!user) return null;
// //     return new UserResponse(id,user.firstname,user.lastname,user.course,user.email,user.age);
// //   }

// //   async getAll(): Promise<UserResponse[]> {
// //     const collection = this.db.getCollection('users');
// //     const users = await collection.find().toArray();
// //     return users.map(user=>new UserResponse(user._id.toString(),user.firstname,user.lastname,user.course,user.email,user.age));
// //   }

// //   async updateUser(id: string, user: UserRequest): Promise<boolean> {
// //     const collection = this.db.getCollection('users');
// //     const result = await collection.updateOne(
// //       {_id: new ObjectId(id)},
// //       {$set:user}
// //     );
// //     return result.modifiedCount > 0;
// //   }

// //   async deleteUser(id: string): Promise<boolean> {
// //     const collection=this.db.getCollection('users');
// //     const result=await collection.deleteOne({_id:new ObjectId(id)});
// //     return result.deletedCount>0;
// //   }
// // }


import { injectable, inject } from 'inversify';
import { Redis } from 'ioredis';
import { DependencyKeys } from '../constant';
import { IUserService } from '../contracts/IUserService';
import { IUserRepository } from '../contracts/IUserRepository';
// import { UserRequest, UserResponse, ValidationError } from '../models/UserModel';
import { UserRequest } from '../models/userRequest';
import { UserResponse } from '../models/userResponse';
import { ValidationError } from '../errors/Validationerror';
// import { RedisClient } from '../redis/RedisClient';
import { RedisClient } from './RedisClient';

@injectable()
export class UserServiceImpl implements IUserService {
  private userRepository: IUserRepository;
  private redisClient: Redis;

  constructor(
    @inject(DependencyKeys.UserRepository) userRepository: IUserRepository,
    @inject(DependencyKeys.RedisClient) redisClient: RedisClient
  ) {
    this.userRepository = userRepository;
    this.redisClient = redisClient.getclient();
  }

  private validateId(id: string): void {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError('Invalid user ID: must be a 24-character hexadecimal string', { id });
    }
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse> {
    const userResponse = await this.userRepository.createUserAsync(user);
    // await this.redisClient.del('users:list');
    return userResponse;
  }

  async getUserAsync(id: string): Promise<UserResponse | null> {
    this.validateId(id);
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisClient.get(cacheKey);
    if (cachedUser) {
      const user=JSON.parse(cachedUser)
      return  new UserResponse(
        user.id,
        user.firstname,
        user.lastname,
        user.email,
        user.age,
        user.hashedPassword
      )
    }
    else {
    const user = await this.userRepository.getUserAsync(id);
    if (user) {
      // Cache the user for 1 hour
      await this.redisClient.set(cacheKey,JSON.stringify(user),'EX',3600);
    }
    return user;
  }
  }

  async findUserAsync(email: string): Promise<UserResponse | null> {
     const cachekey=`user:${email.toLowerCase()}`;
     const cachedUser=await this.redisClient.get(cachekey);
     if (cachedUser) {
      const user=JSON.parse(cachedUser)
      return  new UserResponse(
        user.id,
        user.firstname,
        user.lastname,
        user.email,
        user.age,
        user.hashedPassword
      )
    }
    const user = await this.userRepository.findUserAsync(email);
    if (user) {
      // Cache the user for 1 hour
      await this.redisClient.set(cachekey,JSON.stringify(user),'EX',3600);
    }
    return user;
    // return await this.userRepository.findUserAsync(email);
  }

  async getAllAsync(page: number, limit: number): Promise<{ data: UserResponse[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
     return await this.userRepository.getAllAsync(page,limit);
  }

  async updateUserAsync(id: string, user: UserRequest): Promise<boolean> {
    this.validateId(id);
    const updated = await this.userRepository.updateUserAsync(id, user);
    if (updated) {
      await this.redisClient.del(`user:${id}`);
    }
    return updated;
  }

  async deleteUserAsync(id: string): Promise<boolean> {
    this.validateId(id);
    const deleted = await this.userRepository.deleteUserAsync(id);
    if (deleted) {
      await this.redisClient.del(`user:${id}`);
    }
    return deleted;
  }

  async deleteUsersAsync(emails: string[]): Promise<{ deletedCount: Number,notFoundEmails: string[] }> {
      const {deletedCount, notFoundEmails }= await this.userRepository.deleteUsersAsync(emails);
      if(deletedCount>0){
        // const cachekey=`user:${emails}`;
        const redisDeletePromise=emails.map(async email=>{
          const cachekey=`user:${email}`;
           const exist= await this.redisClient.exists(cachekey);
          if(exist){
          this.redisClient.del(cachekey);
          return {email,status:"deleted"};
          }
          else return {email,status:"not found"};
        });
       await Promise.all(redisDeletePromise);
      //  const notFoundEmails = deletedResults.filter(result=>result?.status=="not found")
      //  .map(result=>result?.email) as string[];
       console.log("Delete Users Result:", { deletedCount: deletedCount, notFoundEmails });
       return { deletedCount: deletedCount,notFoundEmails };
        
      }
      return { deletedCount: 0, notFoundEmails: [] };
  }
}