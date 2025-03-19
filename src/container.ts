import { Container } from 'inversify';
import { IUserService } from './contracts/IUserService';
import { UserServiceImpl } from './impl/UserServiceImpl';
import { AppBuilder } from './AppBuilder';
import { DependencyKeys } from './constant';
import { UserRoutes } from './routes/UserRoutes';
import { DatabaseAccess } from './mongo_connector/DBOperations';
import { UserRepository } from './UserRepository';
import { IUserRepository } from './contracts/IUserRepository';
// import { RedisClient } from './redis/RedisClient';
import { DBConfig } from './mongo_connector/DBConfigProvider';
import { IDBConfig } from './mongo_connector/contracts/IDBConfig';
import { IRediConfig } from './contracts/IRedisConfig';
import { IRedisClient } from './contracts/IRedisClient';
import { RedisConfig } from './impl/RedisConfig';
import { RedisClient } from './impl/RedisClient';

const container = new Container();
 

container.bind<IRediConfig>(DependencyKeys.RedisConfig).to(RedisConfig);
container.bind<IRedisClient>(DependencyKeys.RedisClient).to(RedisClient)

container.bind<IDBConfig>(DependencyKeys.DBConfig).to(DBConfig)
container.bind<DatabaseAccess<any>>(DependencyKeys.DatabaseAccess).to(DatabaseAccess<any>);

// Bind IUserService to UserServiceImpl
container.bind<IUserService>(DependencyKeys.UserService).to(UserServiceImpl);

// Bind UserRoutes
container.bind<UserRoutes>(DependencyKeys.Routes).to(UserRoutes);

// Bind AppBuilder
container.bind<AppBuilder>(DependencyKeys.AppBuilder).to(AppBuilder);

// Bind Userrepository
container.bind<IUserRepository>(DependencyKeys.UserRepository).to(UserRepository);

// Bind RedisClient
// container.bind<RedisClient>(DependencyKeys.RedisClient).to(RedisClient)

export default container;