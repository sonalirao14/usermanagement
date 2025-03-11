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
import { UserRequest, UserResponse, ValidationError } from '../models/UserModel';
import { RedisClient } from '../redis/RedisClient';

@injectable()
export class UserServiceImpl implements IUserService {
  private userRepository: IUserRepository;
  private redisClient: Redis;

  constructor(
    @inject(DependencyKeys.UserRepository) userRepository: IUserRepository,
    @inject(DependencyKeys.RedisClient) redisClient: RedisClient
  ) {
    this.userRepository = userRepository;
    this.redisClient = redisClient.getClient();
  }

  private validateId(id: string): void {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError('Invalid user ID: must be a 24-character hexadecimal string', { id });
    }
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse> {
    const userResponse = await this.userRepository.createUserAsync(user);
    // Invalidate cache for the users list since a new user was added
    await this.redisClient.del('users:list');
    return userResponse;
  }

  async getUserAsync(id: string): Promise<UserResponse | null> {
    this.validateId(id);

    // Check cache first
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisClient.get(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser) as UserResponse;
    }

    // If not in cache, fetch from database
    const user = await this.userRepository.getUserAsync(id);
    if (user) {
      // Cache the user for 1 hour (3600 seconds)
      await this.redisClient.setex(cacheKey, 3600, JSON.stringify(user));
    }
    return user;
  }

  async findUserAsync(email: string): Promise<UserResponse | null> {
    return await this.userRepository.findUserAsync(email);
  }

  async getAllAsync(page: number, limit: number): Promise<{ data: UserResponse[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
    // Use a cache key based on pagination parameters
    const cacheKey = `users:${page}:${limit}`;
    const cachedResult = await this.redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult) as { data: UserResponse[], pagination: { total: number, page: number, limit: number, totalPages: number } };
    }

    // If not in cache, fetch from database
    const result = await this.userRepository.getAllAsync(page, limit);
    // Cache the result for 1 hour (3600 seconds)
    await this.redisClient.setex(cacheKey, 3600, JSON.stringify(result));
    return result;
  }

  async updateUserAsync(id: string, user: UserRequest): Promise<boolean> {
    this.validateId(id);
    const updated = await this.userRepository.updateUserAsync(id, user);
    if (updated) {
      // Invalidate cache for this user and the users list
      await this.redisClient.del(`user:${id}`);
      await this.redisClient.del('users:list');
    }
    return updated;
  }

  async deleteUserAsync(id: string): Promise<boolean> {
    this.validateId(id);
    const deleted = await this.userRepository.deleteUserAsync(id);
    if (deleted) {
      // Invalidate cache for this user and the users list
      await this.redisClient.del(`user:${id}`);
      await this.redisClient.del('users:list');
    }
    return deleted;
  }
}