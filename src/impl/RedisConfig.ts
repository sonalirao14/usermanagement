import { inject,injectable } from "inversify";
import { IRediConfig } from "../contracts/IRedisConfig";
@injectable()
export class RedisConfig implements IRediConfig{
    host: string;
    port: number;
    password?: string;
  
    constructor() {
      this.host='localhost';
      this.port=6379;
      this.password=undefined;
    }
}