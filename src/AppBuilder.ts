import express, { Express } from 'express';
import { injectable, inject } from 'inversify';
import { UserRoutes } from './routes/UserRoutes';
import { DependencyKeys } from './constant';
import { errorHandler } from './middlewares/errorHandler';
import { routeHandler } from './middlewares/routeHandler';
import { requestLogger } from './middlewares/requestLogger';
import { DatabaseAccess } from './mongo_connector/DataBaseAccess';

@injectable()
export class AppBuilder {
  private app: Express;
  private userRoutes: UserRoutes;
  private dbAccess: DatabaseAccess;

  constructor(
    @inject(DependencyKeys.Routes) userRoutes: UserRoutes,
    @inject(DependencyKeys.DatabaseAccess) dbAccess: DatabaseAccess
  ) {
    this.app = express();
    this.userRoutes = userRoutes;
    this.dbAccess = dbAccess;
  }

  build(): AppBuilder {
    this.app.use(requestLogger);
    this.app.use(express.json());
    this.app.use('/', this.userRoutes.getRouter());
    this.app.use(routeHandler);
    this.app.use(errorHandler);
    return this;
  }

  start(port: number): void {
    try {
      this.app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      }).on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Please use a different port.`);
        } else {
          console.error('Failed to start server:', error);
        }
        process.exit(1);
      });
    } catch (error) {
      console.error('Unexpected error during server startup:', error);
      process.exit(1);
    }
  }

  getApp(): Express {
    return this.app;
  }
}