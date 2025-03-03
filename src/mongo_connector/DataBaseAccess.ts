import { MongoClient, Db, Collection, Filter, FindOptions, UpdateFilter, UpdateOptions, DeleteOptions, Document as MongoDocument, OptionalUnlessRequiredId, MongoServerError, ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { IDatabase } from '../contracts/IDataBase';
import { DatabaseError } from '../models/UserModel';
require('dotenv').config();

@injectable()
export class DatabaseAccess implements IDatabase {
  private client: MongoClient;
  private db: Db | undefined;
  private connected: boolean = false;
  private reconnecting: boolean = false;

  constructor() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';
    this.client = new MongoClient(uri, {
      connectTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
    });
  }

  async initialize(): Promise<void> {
    let retries = 5;
    while (retries > 0 && !this.connected) {
      try {
        await this.client.connect();
        this.db = this.client.db('userdb');
        this.connected = true;
        console.log('Connected to MongoDB');

        // Create unique index on email field for the users collection
        try {
          await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
          console.log('Created unique index on email field for users collection');
        } catch (error) {
          if (error instanceof MongoServerError && error.code === 11000) {
            console.warn('E11000 duplicate key error: Duplicate emails found in the users collection. Resolving duplicates...');
            await this.resolveDuplicateEmails();
            // Retry creating the index after resolving duplicates
            await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
            console.log('Successfully created unique index on email field after resolving duplicates');
          } else {
            throw error; // Rethrow other errors
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          retries--;
          console.error(`Failed to connect to MongoDB, retries left: ${retries}`, error.message);
          if (retries === 0) {
            console.error('Max retries reached. Proceeding without MongoDB connection.');
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.error('Unknown error during MongoDB connection:', error);
          break;
        }
      }
    }
  }

  private async resolveDuplicateEmails(): Promise<void> {
    try {
      const collection = this.db!.collection('users');
      // Find duplicate emails
      const duplicates = await collection.aggregate([
        { $group: { _id: "$email", ids: { $push: "$_id" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]).toArray();

      for (const duplicate of duplicates) {
        const ids = duplicate.ids as string[];
        // Keep the first document, delete the rest
        const keepId = ids.shift(); // Keep the first _id
        await collection.deleteMany({ _id: { $in: ids.map(id => new ObjectId(id)) } });
        console.log(`Resolved duplicate email '${duplicate._id}': Kept document with _id '${keepId}', deleted ${ids.length} duplicates`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError('Failed to resolve duplicate emails', error.message);
      }
      throw new DatabaseError('Failed to resolve duplicate emails', 'Unknown error');
    }
  }

  private async reconnect(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;
    this.connected = false;
    this.db = undefined;

    let retries = 5;
    while (retries > 0 && !this.connected) {
      try {
        await this.client.connect();
        this.db = this.client.db('userdb');
        this.connected = true;
        console.log('Reconnected to MongoDB');

        // Re-create unique index on email field
        try {
          await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
          console.log('Created unique index on email field for users collection after reconnection');
        } catch (error) {
          if (error instanceof MongoServerError && error.code === 11000) {
            await this.resolveDuplicateEmails();
            await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
            console.log('Successfully created unique index on email field after resolving duplicates');
          } else {
            throw error;
          }
        }
        break;
      } catch (error) {
        if (error instanceof Error) {
          retries--;
          console.error(`Failed to reconnect to MongoDB, retries left: ${retries}`, error.message);
          if (retries === 0) {
            console.error('Max reconnection retries reached.');
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.error('Unknown error during MongoDB reconnection:', error);
          break;
        }
      }
    }
    this.reconnecting = false;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.reconnect();
      if (!this.connected) {
        throw new DatabaseError('MongoDB is not connected', 'Failed to establish a connection to the database');
      }
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new DatabaseError('MongoDB is not connected', 'Failed to establish a connection to the database');
    }
    return this.db;
  }

  getCollection<T extends MongoDocument>(name: string): Collection<T> {
    try {
      this.ensureConnected();
      return this.getDb().collection<T>(name);
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to access collection '${name}'`, error.message);
      }
      throw new DatabaseError(`Failed to access collection '${name}'`, 'Unknown error');
    }
  }

  async insertOne<T extends MongoDocument>(collectionName: string, document: OptionalUnlessRequiredId<T>): Promise<string> {
    try {
      await this.ensureConnected();
      const collection = this.getCollection<T>(collectionName);
      const result = await collection.insertOne(document);
      return result.insertedId.toString();
    } catch (error) {
      if (error instanceof MongoServerError) {
        if (error.code === 11000) {
          const fieldMatch = error.message.match(/index: (\w+)_1/);
          const field = fieldMatch ? fieldMatch[1] : 'unknown field';
          const valueMatch = error.message.match(/dup key: { : "(.+)" }/);
          const value = valueMatch ? valueMatch[1] : 'unknown value';
          throw new DatabaseError(`Duplicate ${field}: ${value}`, `Duplicate key error: ${error.message}`);
        }
        throw new DatabaseError(`Failed to insert document into collection '${collectionName}'`, error.message);
      }
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to insert document into collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to insert document into collection '${collectionName}'`, 'Unknown error');
    }
  }

  async findOne<T extends MongoDocument>(collectionName: string, query: Filter<T>, options?: FindOptions): Promise<T | null> {
    try {
      await this.ensureConnected();
      const collection = this.getCollection<T>(collectionName);
      return await collection.findOne(query, options);
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find document in collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to find document in collection '${collectionName}'`, 'Unknown error');
    }
  }

  async findAll<T extends MongoDocument>(collectionName: string, query: Filter<T> = {}, options?: FindOptions): Promise<(T & { _id: any })[]> {
    try {
      await this.ensureConnected();
      const collection = this.getCollection<T>(collectionName);
      const docs = await collection.find(query, options).toArray();
      return docs as (T & { _id: any })[];
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to find documents in collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to find documents in collection '${collectionName}'`, 'Unknown error');
    }
  }

  async updateOne<T extends MongoDocument>(collectionName: string, query: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<boolean> {
    try {
      await this.ensureConnected();
      const collection = this.getCollection<T>(collectionName);
      const result = await collection.updateOne(query, update, options);
      return result.modifiedCount > 0;
    } catch (error) {
      if (error instanceof MongoServerError) {
        if (error.code === 11000) {
          const fieldMatch = error.message.match(/index: (\w+)_1/);
          const field = fieldMatch ? fieldMatch[1] : 'unknown field';
          const valueMatch = error.message.match(/dup key: { : "(.+)" }/);
          const value = valueMatch ? valueMatch[1] : 'unknown value';
          throw new DatabaseError(`Duplicate ${field}: ${value}`, `Duplicate key error: ${error.message}`);
        }
        throw new DatabaseError(`Failed to update document in collection '${collectionName}'`, error.message);
      }
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to update document in collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to update document in collection '${collectionName}'`, 'Unknown error');
    }
  }

  async deleteOne<T extends MongoDocument>(collectionName: string, query: Filter<T>, options?: DeleteOptions): Promise<boolean> {
    try {
      await this.ensureConnected();
      const collection = this.getCollection<T>(collectionName);
      const result = await collection.deleteOne(query, options);
      return result.deletedCount > 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to delete document from collection '${collectionName}'`, error.message);
      }
      throw new DatabaseError(`Failed to delete document from collection '${collectionName}'`, 'Unknown error');
    }
  }
}