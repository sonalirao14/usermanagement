import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { DependencyKeys } from './constant';
import { IDatabase } from '../src/contracts/IDataBase';
import { UserRequest, UserResponse, DatabaseError, DuplicateKeyError, NotFoundError } from '../src/models/UserModel';
import { IUserRepository } from './contracts/IUserRepository';
import bcrypt from 'bcrypt'
@injectable()
export class UserRepository implements IUserRepository {
  private db: IDatabase;
  private readonly collectionName = 'users';
  private readonly saltRounds = 10;

  constructor(@inject(DependencyKeys.DatabaseAccess) db: IDatabase) {
    this.db = db;
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse> {
    try {
      const existingUser = await this.db.findOne<UserRequest>(this.collectionName, { email: user.email });
      if (existingUser) {
        throw new DuplicateKeyError(`Duplicate email: ${user.email}`, { email: user.email });
      }

      const hashedPassword = await bcrypt.hash(user.password, this.saltRounds);
      const userToInsert = {
        firstname: user.firstname,
        lastname:user.lastname,
        email: user.email,
        age: user.age,
        hashedPassword,
      };

      const userId = await this.db.insertOne(this.collectionName, userToInsert);
      return new UserResponse(userId, user.firstname, user.lastname, user.email, user.age, hashedPassword);
    } catch (error) {
      if (error instanceof DuplicateKeyError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new DatabaseError('Failed to create user in database', error.message);
      }
      throw new DatabaseError('Failed to create user in database', 'Unknown error');
    }
  }

  async getUserAsync(id: string): Promise<UserResponse | null> {
    try {
      const user = await this.db.findOne<UserResponse>(this.collectionName, { _id: new ObjectId(id) });
      if (!user) return null;
      return new UserResponse(id, user.firstname, user.lastname, user.email, user.age, user.hashedPassword);
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to fetch user with ID ${id}`, error.message);
      }
      throw new DatabaseError(`Failed to fetch user with ID ${id}`, 'Unknown error');
    }
  }

  async findUserAsync(email: string): Promise<UserResponse | null> {
    try {
      const user = await this.db.findOne<UserResponse>(this.collectionName, {email});
      if (!user){
        throw new NotFoundError("User Not exist");
      }
      if(!user._id){
         throw new NotFoundError("User Not exist");
      }
      return new UserResponse(user._id.toString(), user.firstname, user.lastname, user.email, user.age, user.hashedPassword);
    } catch (error) {
      if (error instanceof Error) {
       throw error;
      }
      console.error(`Database error while fetching user with email ${email}:`, error);

      throw new DatabaseError(`Failed to fetch user with ID ${email}`, 'Unknown error');
    }
  }
  async getAllAsync(page: number, limit: number): Promise<{ data: UserResponse[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
    try {
      const pageNum = Math.max(1, page);
      const limitNum = Math.max(1, limit);
      const skip = (pageNum - 1) * limitNum;
      const total = await this.db.getCollection<UserResponse>(this.collectionName).countDocuments();

      // Fetch the paginated users
      const users = await this.db.getCollection<UserResponse>(this.collectionName)
        .find()
        .skip(skip)
        .limit(limitNum)
        .toArray();
      const data = users.map(user => new UserResponse(user._id.toString(), user.firstname, user.lastname, user.email, user.age, user.hashedPassword));
      const totalPages = Math.ceil(total / limitNum);

      return {
        data,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      };
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


