import { Collection, Db } from 'mongodb';

export interface IDatabase {
  getDb(): Db;
  getCollection(name: string): Collection;
}