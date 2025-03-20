import { Collection, Db, Filter, FindOptions, UpdateFilter, UpdateOptions, DeleteOptions, Document as MongoDocument, OptionalUnlessRequiredId, WithId } from 'mongodb';

export interface IDatabase {
  getDb(): Db;
  getCollection<T extends MongoDocument>(name: string): Collection<T>;
  insertOne<T extends MongoDocument>(collectionName: string, document: OptionalUnlessRequiredId<T>): Promise<string>;
  findOne<T extends MongoDocument>(collectionName: string, query: Filter<T>, options?: FindOptions): Promise<T | null>;
  findAll<T extends MongoDocument>(collectionName: string, query?: Filter<T>, options?: FindOptions): Promise<(T & { _id: any })[]>;
  updateOne<T extends MongoDocument>(collectionName: string, query: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<boolean>;
  deleteOne<T extends MongoDocument>(collectionName: string, query: Filter<T>, options?: DeleteOptions): Promise<boolean>;
}