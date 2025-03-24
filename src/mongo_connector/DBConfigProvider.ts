import { MongoClient, Db, Collection, Document as MongoDocument } from 'mongodb';
import { injectable } from 'inversify';
import { IDBConfig } from './contracts/IDBConfig';
import { DatabaseError } from '../errors/DBerror';
import dotenv from 'dotenv';

dotenv.config();

@injectable()
export class DBConfig implements IDBConfig {
  private client: MongoClient;
  private db: Db | undefined;
  private connected: boolean = false;
  private reconnecting: boolean = false;
  private readonly uri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';
  private readonly dbName: string = 'userdb';

  constructor() {
    this.client = new MongoClient(this.uri, {
      connectTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
    });
  }

  async initialize(): Promise<void> {
    let retries = 5;
    while (retries > 0 && !this.connected) {
      try {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        this.connected = true;
        console.log('Connected to MongoDB');
        break;
      } catch (error) {
        retries--;
        console.error(`Failed to connect to MongoDB, retries left: ${retries}`, error);
        if (retries === 0) {
          console.error('Max retries reached.');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  public async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.initialize();
      if (!this.connected) {
        throw new DatabaseError('MongoDB is not connected', 'Failed to establish a connection');
      }
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new DatabaseError('MongoDB is not connected', "Database is not initialized");
    }
    return this.db;
  }

  getCollection<T extends MongoDocument>(name: string): Collection<T> {
    this.ensureConnected();
    return this.getDb().collection<T>(name);
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
      console.log('MongoDB connection closed');
    }
  }
}