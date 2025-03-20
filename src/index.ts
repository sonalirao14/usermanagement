import 'reflect-metadata';
import container from './container';
import { AppBuilder } from './AppBuilder';
import { UserRoutes } from './routes/UserRoutes';
import { DependencyKeys } from './constant';
import { DatabaseAccess } from './mongo_connector/DBOperations';
import { DBConfig } from './mongo_connector/DBConfigProvider';
// import { RedisClient } from './redis/RedisClient';
import { RedisClient } from './impl/RedisClient';
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const portEnv = process.env.PORT;
const port: number = portEnv && !isNaN(parseInt(portEnv)) ? parseInt(portEnv) : 3000;

async function startServer() {
  const dbAccess = container.get<DBConfig>(DependencyKeys.DBConfig);
  const appBuilder = container.get<AppBuilder>(DependencyKeys.AppBuilder);
  const userRoutes = container.get<UserRoutes>(DependencyKeys.Routes);
  const redisClient = container.get<RedisClient>(DependencyKeys.RedisClient);

  try {
    await dbAccess.initialize();
    console.log('Successfully Database initialised!');
  } catch (e) {
    console.error('Failure in initialisation of database:', e);
    process.exit(1);
  }

  appBuilder
    .withRequestLogger()
    .withCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
    .withApiContext('keys/private.pem', 'keys/public.pem')
    .withPublicRoutes(['/register', '/login'])
    .withJsonContent()
    .withRoute('/', userRoutes.getRouter())
    .withRouteHandler()
    .withErrorHandler()
    .build();

  const server = appBuilder.start(port);
  const shutdown = async () => {
    console.log('Trying to shut down server..');
    await redisClient.disconnect();
    console.log('Server closed');
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();