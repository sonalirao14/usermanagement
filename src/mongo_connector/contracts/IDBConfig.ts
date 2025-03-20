// import { Db, Collection, Document as MongoDocument } from 'mongodb';

export interface IDBConfig {
  initialize(): Promise<void>;
  ensureConnected(): Promise<void>;
  // getDb(): Db;
  getCollection<T>(name: string): any;
  disconnect(): Promise<void>;
}