import { inject,injectable } from "inversify";
import { IRedisClient } from "../contracts/IRedisClient";
import { IRediConfig } from "../contracts/IRedisConfig";
import { Redis } from "ioredis";
import { DependencyKeys } from "../constant";
@injectable()
export class RedisClient implements IRedisClient{
    private client: Redis;

    constructor(@inject(DependencyKeys.RedisConfig) redisConfig: IRediConfig) {
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      });
  
      this.client.on('connect', () => {
        console.log('Connected to Redis');
      });
  
      this.client.on('error', (e) => {
        console.error('Redis Client Error:', e);
      });
    }
  
    public getclient(): Redis {
      return this.client;
    }
  
    public async disconnect(): Promise<void> {
      if (this.client) {
        await this.client.quit();
        console.log('Redis connection closed');
      }
    }
}