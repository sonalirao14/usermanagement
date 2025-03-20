import { Container } from 'inversify';
// import { DatabaseAccess } from './mongo-connector/DatabaseAccess';
import { IUserService } from './contracts/IUserService';
import { UserServiceImpl } from './impl/UserServiceImpl';
import { AppBuilder } from './AppBuilder';
import { DependencyKeys } from './constant';
import { UserRoutes } from './routes/UserRoutes';
import { DatabaseAccess } from './mongo_connector/DataBaseAccess';
import { UserRepository } from './UserRepository';
import { IUserRepository } from './contracts/IUserRepository';

const container = new Container();

// Bind DatabaseAccess
container.bind<DatabaseAccess>(DependencyKeys.DatabaseAccess).to(DatabaseAccess);

// Bind IUserService to UserServiceImpl
container.bind<IUserService>(DependencyKeys.UserService).to(UserServiceImpl);

// Bind UserRoutes
container.bind<UserRoutes>(DependencyKeys.Routes).to(UserRoutes);

// Bind AppBuilder
container.bind<AppBuilder>(DependencyKeys.AppBuilder).to(AppBuilder);

// Bind Userrepository
container.bind<IUserRepository>(DependencyKeys.UserRepository).to(UserRepository);

export default container;