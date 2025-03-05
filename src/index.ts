// import 'reflect-metadata';
// import container from './container';
// import { AppBuilder } from './AppBuilder';
// import { DependencyKeys } from './constant';
// import { DatabaseAccess } from './mongo_connector/DataBaseAccess';
// import { UserRoutes } from './routes/UserRoutes';
// require('dotenv').config();

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
// });

// // Global handler for uncaught exceptions
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
// });

// async function startServer() {
//   const dbAccess = container.get<DatabaseAccess>(DependencyKeys.DatabaseAccess);
//   const appBuilder = container.get<AppBuilder>(DependencyKeys.AppBuilder);
//   const userRoute = container.get<UserRoutes>(DependencyKeys.Routes)

//   try {
//     await dbAccess.initialize();
//   } catch (error) {
//     console.error('Failed to initialize database connection:', error);
//   }
  
//    // Parse the port from the environment variable, with a fallback to 3000
//     const portEnv = process.env.PORT;

//   const port :number = portEnv && !isNaN(parseInt(portEnv)) ? parseInt(portEnv) : 3000;
//   appBuilder
//   .withRequestLogger()
//   .withCors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
//   .withJsonContent()
//   .withRoute('/', userRoute.getRouter())
//   .withRouteHandler()
//   .withErrorHandler()
//   .build();

// appBuilder.start(port);
// }

// startServer();

import 'reflect-metadata';
import container from './container';
import { AppBuilder } from './AppBuilder';
import { UserRoutes } from './routes/UserRoutes';
import { DependencyKeys } from './constant';
import { DatabaseAccess } from './mongo_connector/DataBaseAccess';
require('dotenv').config();

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
// });

// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
// });

const portEnv = process.env.PORT;
const port: number = portEnv && !isNaN(parseInt(portEnv)) ? parseInt(portEnv) : 3000;

async function startServer() {
  const dbAccess = container.get<DatabaseAccess>(DependencyKeys.DatabaseAccess);
  const appBuilder = container.get<AppBuilder>(DependencyKeys.AppBuilder);
  const userRoutes = container.get<UserRoutes>(DependencyKeys.Routes);

  try {
    await dbAccess.initialize();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
  }

  appBuilder
    .withRequestLogger()
    .withCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
    .withApiContext('keys/private.pem', 'keys/public.pem')
    .withPublicRoutes(['/api/register', '/api/login', '/api/public'])
    .withJsonContent()
    .withRoute('/', userRoutes.getRouter())
    .withRouteHandler()
    .withErrorHandler()
    .build();

  appBuilder.start(port);
}

startServer();