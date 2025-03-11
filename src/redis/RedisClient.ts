import { Redis } from 'ioredis';
import { injectable } from 'inversify';

@injectable()
export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

   constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('error',(e)=>{
      console.error('Redis Client Error:',e);
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    // await this.client.quit();
    if (this.client) {
        await this.client.quit(); 
        console.log('Redis connection closed');
      }
  }
}