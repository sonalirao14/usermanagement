import Redis from "ioredis";
export interface IRedisClient{
    getclient():Redis;
    disconnect():Promise<void>;
}