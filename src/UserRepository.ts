import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { DependencyKeys } from './constant';
import { IDatabase } from '../src/contracts/IDataBase';
import { UserRequest, UserResponse, DatabaseError, DuplicateKeyError } from '../src/models/UserModel';
import { IUserRepository } from './contracts/IUserRepository';

@injectable()
export class UserRepository implements IUserRepository {
  private db: IDatabase;
  private readonly collectionName = 'users';

  constructor(@inject(DependencyKeys.DatabaseAccess) db: IDatabase) {
    this.db = db;
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse> {
    try {
      // Check for existing user with the same email
      const existingUser = await this.db.findOne<UserRequest>(this.collectionName, { email: user.email });
      if (existingUser) {
        throw new DuplicateKeyError(`Duplicate email: ${user.email}`, { email: user.email });
      }
      const userId = await this.db.insertOne<UserRequest>(this.collectionName, user);
      return new UserResponse(userId, user.firstname,user.lastname,user.course, user.email, user.age);
    } catch (error) {
      if (error instanceof DuplicateKeyError) {
        throw error; // Re-throw DuplicateKeyError without modification
      }
      if (error instanceof Error) {
        if (error.message.includes('Duplicate')) {
          throw new DuplicateKeyError(error.message, { email: user.email });
        }
        throw new DatabaseError('Failed to create user in database', error.message);
      }
      throw new DatabaseError('Failed to create user in database', 'Unknown error');
    }
  }

  async getUserAsync(id: string): Promise<UserResponse | null> {
    try {
      const user = await this.db.findOne<UserResponse>(this.collectionName, { _id: new ObjectId(id) });
      if (!user) return null;
      return new UserResponse(id, user.firstname, user.lastname, user.course, user.email, user.age);
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to fetch user with ID ${id}`, error.message);
      }
      throw new DatabaseError(`Failed to fetch user with ID ${id}`, 'Unknown error');
    }
  }

  async getAllAsync(): Promise<UserResponse[]> {
    try {
      const users = await this.db.findAll<UserResponse>(this.collectionName);
      return users.map(user => new UserResponse(user._id.toString(), user.firstname, user.lastname,user.course, user.email, user.age));
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError('Failed to fetch all users', error.message);
      }
      throw new DatabaseError('Failed to fetch all users', 'Unknown error');
    }
  }

  async updateUserAsync(id: string, user: UserRequest): Promise<boolean> {
    try {
      const existingUser = await this.db.findOne<UserRequest &  { _id: ObjectId }>(this.collectionName, { email: user.email });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new DuplicateKeyError(`Duplicate email: ${user.email}`, { email: user.email });
      }
      return await this.db.updateOne<UserRequest>(this.collectionName, { _id: new ObjectId(id) }, { $set: user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Duplicate')) {
          throw new DuplicateKeyError(error.message, { email: user.email });
        }
        throw new DatabaseError(`Failed to update user with ID ${id}`, error.message);
      }
      throw new DatabaseError(`Failed to update user with ID ${id}`, 'Unknown error');
    }
  }

  async deleteUserAsync(id: string): Promise<boolean> {
    try {
      return await this.db.deleteOne(this.collectionName, { _id: new ObjectId(id) });
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to delete user with ID ${id}`, error.message);
      }
      throw new DatabaseError(`Failed to delete user with ID ${id}`, 'Unknown error');
    }
  }
}