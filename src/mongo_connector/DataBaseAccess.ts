import { MongoClient, Db, Collection } from 'mongodb';
import { injectable } from 'inversify';
import { IDatabase } from '../contracts/IDataBase';
require('dotenv').config();

@injectable()
export class DatabaseAccess implements IDatabase {
  private client: MongoClient;
  private db: Db | undefined;

  constructor(){
    const uri=process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';
    this.client=new MongoClient(uri);
    this.connect();
  }

  private async connect():Promise<void>{
    try{
      await this.client.connect();
      this.db = this.client.db('userdb');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  getDb():Db{
    if(!this.db) throw new Error('Database not connected');
    return this.db;
  }

  getCollection(name:string):Collection{
    return this.getDb().collection(name);
  }
}