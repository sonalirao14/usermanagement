import express, { Express } from 'express';
import { injectable, inject } from 'inversify';
import { UserRoutes } from './routes/UserRoutes';
import { DependencyKeys } from './constant';
import { errorHandler, requestLogger } from './middlewares/errorHandler';

@injectable()
export class AppBuilder {
  private app: Express;
  private userRoutes: UserRoutes;

  constructor(@inject(DependencyKeys.Routes) userRoutes: UserRoutes) {
    
    this.app = express();
    this.userRoutes = userRoutes;
  }

  build(): AppBuilder {
    this.app.use(requestLogger);
    this.app.use(express.json());
    this.app.use('/', this.userRoutes.getRouter());
    this.app.use(errorHandler);
    return this;
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }

  getApp(): Express {
    return this.app;
  }
}