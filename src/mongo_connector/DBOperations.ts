import { MongoClient, Db, Collection, Filter, FindOptions, UpdateFilter, UpdateOptions, DeleteOptions, Document as MongoDocument, OptionalUnlessRequiredId, MongoServerError, ObjectId } from 'mongodb';
import { injectable , inject} from 'inversify';
import { IDatabase } from './contracts/IDataBase';
import { DatabaseError } from '../errors/DBerror';
import { DependencyKeys } from '../constant';
import { IDBConfig } from './contracts/IDBConfig';
// import { DBConfig } from './DBConfigProvider';
require('dotenv').config();

@injectable()
export class DatabaseAccess<T> implements IDatabase<T> {
  constructor(
    @inject(DependencyKeys.DBConfig) private dbConfig: IDBConfig
  ) {}

  async insertOne(collectionName: string, document: T): Promise<string> {
    try {
      await this.dbConfig.ensureConnected();
      const collection = this.dbConfig.getCollection<T>(collectionName);
      const result = await collection.insertOne(document);
      return result.insertedId.toString();
    } catch (error) {
      throw new DatabaseError(`Failed to insert document into collection '${collectionName}'`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  async findOne(collectionName: string, query: Filter<T>, options?: FindOptions): Promise<T | null> {
    try {
      await this.dbConfig.ensureConnected();
      const collection = this.dbConfig.getCollection<T>(collectionName);
      return await collection.findOne(query, options);
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find document in collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to find document in collection '${collectionName}'`, 'Unknown error');
    }
  }

  async findAll(collectionName: string, query: Filter<T> = {}, options?: FindOptions): Promise<(T & { _id: any })[]> {
    try {
      await this.dbConfig.ensureConnected();
      const collection = this.dbConfig.getCollection<T>(collectionName);
      const docs = await collection.find(query, options).toArray();
      return docs as (T & { _id: any })[];
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find documents in collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to find documents in collection '${collectionName}'`, 'Unknown error');
    }
  }

  async updateOne(collectionName: string, query: Record<string, any>, update: Partial<T>): Promise<boolean> {
    try {
      await this.dbConfig.ensureConnected();
      const collection = this.dbConfig.getCollection<T>(collectionName);
      const result = await collection.updateOne(query, update);
      return result.modifiedCount > 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to update document in collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to update document in collection '${collectionName}'`, 'Unknown error');
    }
  }

  async deleteOne(collectionName: string, query: Filter<T>, options?: DeleteOptions): Promise<boolean> {
    try {
      await this.dbConfig.ensureConnected();
      const collection = this.dbConfig.getCollection<T>(collectionName);
      const result = await collection.deleteOne(query, options);
      return result.deletedCount > 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to delete document from collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to delete document from collection '${collectionName}'`, 'Unknown error');
    }
  }

  async deleteMany(collectionName: string, query: Filter<T>): Promise<{ deletedCount: number }> {
      try{
        await this.dbConfig.ensureConnected();
        const collection=this.dbConfig.getCollection<T>(collectionName);
        const result = await collection.deleteMany(query);
        return { deletedCount: result.deletedCount};

      } catch(error){
        if (error instanceof Error) {
          throw new DatabaseError(`Failed to delete document from collection '${collectionName}'`, error.message);
        }
        throw new DatabaseError(`Failed to delete document from collection '${collectionName}'`, 'Unknown error');
      }
  }

}

