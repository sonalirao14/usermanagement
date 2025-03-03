import 'reflect-metadata';
import container from './container';
import { AppBuilder } from './AppBuilder';
import { DependencyKeys } from './constant';
import { DatabaseAccess } from './mongo_connector/DataBaseAccess';
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
});

// Global handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

async function startServer() {
  const dbAccess = container.get<DatabaseAccess>(DependencyKeys.DatabaseAccess);
  const appBuilder = container.get<AppBuilder>(DependencyKeys.AppBuilder);

  try {
    await dbAccess.initialize();
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
  }
   // Parse the port from the environment variable, with a fallback to 3000
    const portEnv = process.env.PORT;

  const port :number = portEnv && !isNaN(parseInt(portEnv)) ? parseInt(portEnv) : 3000;
  appBuilder.build().start(port);
}

startServer();