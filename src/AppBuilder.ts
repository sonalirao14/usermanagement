import express, { Express, Request, Router } from 'express';
import cors from 'cors';
import { injectable, inject } from 'inversify';
import { NextFunction, Response } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { DependencyKeys } from './constant';
import { errorHandler } from './middlewares/errorHandler';
import { routeHandler } from './middlewares/routeHandler';
import { requestLogger } from './middlewares/requestLogger';
import { DatabaseAccess } from './mongo_connector/DBOperations';
import { publicRoutes } from './config/publicRoute';
import { installApiContext, loadDefaultContext,setJwtKeys } from './middlewares/authMiddleware';
@injectable()
export class AppBuilder {
  private app: Express;
  private _routes: Map<string, Router> = new Map<string, Router>();
  private skipRoutes: string[] = [];
  private enableRequestLogger: boolean = false;
  private enableCors: boolean = false;
  private enableApiContext: boolean = false;
  private enableJsonContent: boolean = false;
  private enableRouteHandler: boolean = false;
  private enableErrorHandler: boolean = false;
  private publicRoutes: string[] = [];
  private jwtPrivateKey: string = '';
  private jwtPublicKey: string = '';
  private corsOptions: {
    origin: string;
    methods: string[];
    allowedHeaders: string[];
  } = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  private dbAccess: DatabaseAccess;

  constructor(
    @inject(DependencyKeys.DBConfig) dbAccess: DatabaseAccess
  ) {
    this.app = express();
    this.dbAccess = dbAccess;
  }

  public withRequestLogger(): AppBuilder {
    this.enableRequestLogger = true;
    return this;
  }

  public withCors(options?: {
    origin?: string;
    methods?: string[];
    allowedHeaders?: string[];
  }): AppBuilder {
    this.enableCors = true;
    if (options) {
      this.corsOptions = {
        origin: options.origin ?? this.corsOptions.origin,
        methods: options.methods ?? this.corsOptions.methods,
        allowedHeaders: options.allowedHeaders ?? this.corsOptions.allowedHeaders,
      };
    }
    return this;
  }

 
public withApiContext(jwtPrivateKeyPath: string, jwtPublicKeyPath: string): AppBuilder {
  this.enableApiContext = true;
  this.jwtPrivateKey = fs.readFileSync(path.resolve(jwtPrivateKeyPath), 'utf8');
  this.jwtPublicKey = fs.readFileSync(path.resolve(jwtPublicKeyPath), 'utf8');

  setJwtKeys(jwtPublicKeyPath); 
  return this;
}

  public withPublicRoutes(routes: string[]): AppBuilder {
    this.publicRoutes = routes;
    return this;
  }

  public withJsonContent(): AppBuilder {
    this.enableJsonContent = true;
    return this;
  }

  public withRouteHandler(): AppBuilder {
    this.enableRouteHandler = true;
    return this;
  }

  public withErrorHandler(): AppBuilder {
    this.enableErrorHandler = true;
    return this;
  }


  public withRoute(routeKey: string, router: Router, skipRoutes: string[] = []): AppBuilder {
    this._routes.set(routeKey, router);
    this.skipRoutes = Array.isArray(skipRoutes) ? skipRoutes : [];
    return this;
  }

  public build(): Express {
    if (this.enableRequestLogger) {
      this.app.use(requestLogger);
    }

    if (this.enableCors) {
      this.app.use(cors(this.corsOptions));
    }

    if (this.enableJsonContent) {
      this.app.use(express.json());
    }

    if (this.enableApiContext) {
      this.app.use(installApiContext);
    } else {
      this.app.use(loadDefaultContext);
    }
   

    this._routes.forEach((router, key) => {
      this.app.use(key, router);
    });

    if (this.enableRouteHandler) {
      this.app.use(routeHandler);
    }

    if (this.enableErrorHandler) {
      this.app.use(errorHandler);
    }

    return this.app;
  }


  public start(port: number): void {
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

  public getApp(): Express {
    return this.app;
  }
}

// Extend Express Request interface to include context
declare global {
  namespace Express {
    interface Request {
      context: {
        authToken: string | null;
        userId: string | null;
        isAdmin: boolean;
        email: string | null;
        tenantId?: string | null;
      };
    }
  }
}