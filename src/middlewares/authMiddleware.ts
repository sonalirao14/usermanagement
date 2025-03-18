import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { publicRoutes } from '../config/publicRoute';
import fs from 'fs';
import path from 'path';
import { jwtParseFunction } from '../utils/jwtUtils';

let jwtPublicKey: string = '';

export const setJwtKeys = (publicKeyPath: string) => {
  jwtPublicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
};

export const installApiContext = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
  if (publicRoutes.includes(req.path)) {
    return loadDefaultContext(req, res, next);
  }

  try {
    const authorization: string | undefined = req.headers.authorization;
    let authToken: string | null = null;

    if (authorization && authorization.startsWith('Bearer ')) {
      authToken = authorization.slice(7);
    }

    if (authToken) {
      // jwt.verify(authToken, jwtPublicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      //   if (err) {
      //     return res.status(403).json({ message: 'Auth token is expired or missing' });
      //   }

        // **Explicitly type the decoded object as JwtPayload**
        // const payload = decoded as JwtPayload;
        const payload = await jwtParseFunction(authToken, jwtPublicKey) as JwtPayload;
        req.context = {
          authToken,
          userId: payload?.userId || null,
          isAdmin: payload?.isAdmin || false,
          email: payload?.email || null,
          tenantId: payload?.tenantId || null,
        };

        next();
      }
     else {
      res.status(403).json({ message: 'Auth token is expired or missing' });
    }
  } catch (error) {
    res.status(403).json({ message: 'Auth token is expired or missing' });
  }
};

export const loadDefaultContext = (req: Request, res: Response, next: NextFunction): void => {
  req.context = {
    authToken: null,
    userId: null,
    isAdmin: false,
    email: null,
    tenantId: null,
  };
  next();
};
