import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { DependencyKeys } from './constant';
import { IDatabase } from './mongo_connector/contracts/IDataBase';
// import { UserRequest, UserResponse } from '../src/models/UserModel';
import { UserRequest } from './models/userRequest';
import { UserResponse } from './models/userResponse';
import { IUserRepository } from './contracts/IUserRepository';
import { DatabaseError } from './errors/DBerror';
import { DuplicateKeyError } from './errors/DuplicationError';
import { NotFoundError } from './errors/NotFound';
import { DBConfig } from './mongo_connector/DBConfigProvider';
import bcrypt from 'bcrypt'
import { IDBConfig } from './mongo_connector/contracts/IDBConfig';
@injectable()
export class UserRepository implements IUserRepository {
  private db: IDatabase<any>;
  private readonly collectionName = 'users';
  private readonly saltRounds = 10;
  private dbConfig: IDBConfig;

  constructor(@inject(DependencyKeys.DatabaseAccess) db: IDatabase<any>, @inject(DependencyKeys.DBConfig) dbConfig:IDBConfig) {
    this.db = db;
    this.dbConfig=dbConfig
  }

  async createUserAsync(user: UserRequest): Promise<UserResponse> {
    try {
      const existingUser = await this.db.findOne(this.collectionName, { email: user.email });
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
      const user = await this.db.findOne(this.collectionName, { _id: new ObjectId(id) });
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
      const user = await this.db.findOne(this.collectionName, {email: email});
      if (!user){
        throw new NotFoundError("Email not exist");
      }
      if(!user._id){
         throw new NotFoundError("Email user not exist");
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
      const total = await this.dbConfig.getCollection(this.collectionName).countDocuments();

      // Fetch the paginated users
      const users : UserResponse[] = await this.dbConfig.getCollection<UserResponse>(this.collectionName)
        .find()
        .skip(skip)
        .limit(limitNum)
        .toArray();
       
      const data = users.map(user => new UserResponse((user._id as ObjectId).toString(), user.firstname, user.lastname, user.email, user.age, user.hashedPassword));
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
      const existingUser = await this.db.findOne(this.collectionName, { email: user.email });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new DuplicateKeyError(`Duplicate email: ${user.email}`, { email: user.email });
      }
      return await this.db.updateOne(this.collectionName, { _id: new ObjectId(id) }, { $set: user });
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
  async deleteUsersAsync(emails: string[]): Promise<{ deletedCount: number, notFoundEmails: string[] }> {
      try{
        // const notFoundEmails: string[] = [];
        const deletePromises = emails.map(async email=>{
          const userExists = await this.db.findOne(this.collectionName,{ email });
          if (!userExists) {
            return {email,deleted: false };
          }
        const deleted=await this.db.deleteOne(this.collectionName, { email });
        return deleted?{email,deleted:true}:{email,deleted:false}
        });
        const results = await Promise.all(deletePromises);
        const deletedCount = results.filter(result=>result.deleted).length;
        const notFoundEmails=results.filter(result=>!result.deleted).map(result=>result.email);
        return {deletedCount,notFoundEmails};
      } catch(e){
     if(e instanceof Error){
      throw new DatabaseError(`Failed to delete user with email ${emails}`, e.message);
     }
     throw new DatabaseError(`Failed to delete user with email ${emails}`, 'Unknown error');
      }
  }
}


