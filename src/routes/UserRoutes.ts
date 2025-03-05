// // import { Router } from 'express';
// // import { injectable, inject } from 'inversify';
// // import { IUserService } from '../contracts/IUserService';
// // import { DependencyKeys } from '../constant';
// // import { validateUser } from '../middlewares/validateUser';
// // import { UserRequest } from '../models/UserModel';

// // @injectable()
// // export class UserRoutes {
// //   private router: Router;
// //   private userService: IUserService;

// //   constructor(@inject(DependencyKeys.UserService) userService: IUserService) {
// //     this.router = Router();
// //     this.userService = userService;
// //     this.setupRoutes();
// //   }

// //   private setupRoutes() {
// //     // Create a User
// //     this.router.post('/user', validateUser, async (req, res) => {
// //       try {
// //         const user = UserRequest.builder()
// //           .withName(req.body.firstname)
// //           .withLastName(req.body.lastname)
// //           .withcourse(req.body.course)
// //           .withEmail(req.body.email)
// //           .withAge(req.body.age)
// //           .build();
// //         const result = await this.userService.createUser(user);
// //         res.status(201).json(result);
// //       } catch (e) {
// //         res.status(500).json({e});
// //       }
// //     });


// //     // Get All Users data
// //     this.router.get('/users', async (req, res) => {
// //         try {
// //           const users = await this.userService.getAll();
// //           res.status(200).json(users);
// //         } catch (e) {
// //           res.status(500).json({e});
// //         }
// //       });
  
// //       // Get a single user data based on id
// //       this.router.get('/user/:id', async (req, res) => {
// //         try {
// //           // Validate the ID format (MongoDB ObjectId should be a 24-character hex string)
// //           const id = req.params.id;
// //           if (!id.match(/^[0-9a-fA-F]{24}$/)) {
// //          res.status(400).json({error:'Invalid user ID'});
// //           }
// //           const user = await this.userService.getUser(id);
// //           if (!user) {
// //           res.status(404).json({message:"User not found"});
// //           }
// //           res.status(200).json(user);
// //         } catch (e) {
// //           res.status(500).json({e,message:'Failed to fetch user'});
// //         }
// //       });

// //     // Update User data 
// //     this.router.put('/user/:id', validateUser, async (req, res) => {
// //       try {
// //         const user = UserRequest.builder()
// //           .withName(req.body.firstname)
// //           .withLastName(req.body.lastname)
// //           .withcourse(req.body.course)
// //           .withEmail(req.body.email)
// //           .withAge(req.body.age)
// //           .build();
// //         const updated = await this.userService.updateUser(req.params.id, user);
// //         if (!updated){
// //               res.status(404).json({message:'User not exist'});
// //         }
// //         res.json({message:'User updated'});
// //       } catch (error) {
// //         res.status(500).json({error,message:'Updation failed'});
// //       }
// //     });

// //     // Delete User
// //     this.router.delete('/user/:id', async (req, res) => {
// //       try {
// //         const deleted = await this.userService.deleteUser(req.params.id);
// //         if (!deleted) {
// //              res.status(404).json({message:"User not exist"});
// //         }
// //         res.json({message:'User deleted'});
// //       }catch(error){
// //         res.status(500).json({error,message:'Deletion failed'});
// //       }
// //     });
// //   }

// //   getRouter(): Router {
// //     return this.router;
// //   }
// // }


// import { Router, Request, NextFunction } from 'express';
// import { injectable, inject } from 'inversify';
// import { IUserService } from '../contracts/IUserService';
// import { DependencyKeys } from '../constant';
// import { validateUser } from '../middlewares/validateUser';
// import { NotFoundError, UserRequest, UserResponse, ValidationError } from '../models/UserModel';

// @injectable()
// export class UserRoutes {
//   private router: Router;
//   private userService: IUserService;

//   constructor(@inject(DependencyKeys.UserService) userService: IUserService) {
//     this.router = Router();
//     this.userService = userService;
//     this.setupRoutes();
//   }

//   private setupRoutes() {
//     // Add User into database
//     this.router.post('/user', validateUser, async (req, res,next) => {
//      try{ const user = UserRequest.fromJson(req.body);
//       const result = await this.userService.createUserAsync(user);
//       res.status(201).json(result);
//       return;
//      } catch(e){
//       next(e);
//      }
//     });

//     // Get All Users data
//     this.router.get('/users', async (req: Request, res, next:NextFunction) => {
//      try{ const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;

//       const users= await this.userService.getAllAsync(page, limit);
//       res.status(200).json(users);
//       return;
//      }catch(error){
//       next(error);
//      }
//     });

//     // Get specific User by id
//     this.router.get('/user/:id', async (req: Request, res,next) => {
//      try{ const id = req.params.id;
//       if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//         const error = new ValidationError('Invalid user ID') as any;
//         throw error;
//       }
//       const user = await this.userService.getUserAsync(id);
//       if (!user) {
//         const error = new NotFoundError('User not found') as any;
//         throw error;
//       }
//       res.status(200).json(user);
//     }catch(e){
//       next(e);
//     }
//     });
//     this.router.get('/users/:email',async(req:Request,res, next)=>{
//       try{
//         const email=req.params.email;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
//         if (!emailRegex.test(email)) {
//            const error=new ValidationError('Invalid Email Format') 
//            throw error;
//         }
//         const user=await this.userService.findUserAsync(email);
//         res.status(200).json(user);
//       }
//       catch(e){
//         next(e);
//       }
//     })

//     // Update User data
//     this.router.put('/user/:id', validateUser, async (req: Request, res,next) => {
//      try{ const id = req.params.id;
//       if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//         const error = new ValidationError('Invalid user ID') as any;
//         throw error;
//       }
//       const user = UserRequest.fromJson(req.body);
//       const updated = await this.userService.updateUserAsync(id, user);
//       if (!updated) {
//         const error = new NotFoundError('User not found') as any;
//         throw error;
//       }
//       res.status(200).json({ message: 'User updated' });
//     } catch(e){
//       next(e);
//     }
//     });

//     // Delete User based on given id
//     this.router.delete('/users/:id', async (req: Request, res,next) => {
//       try{const id = req.params.id;
//       if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//         const error = new ValidationError('Invalid user ID');
//         throw error;
//       }
//       const deleted = await this.userService.deleteUserAsync(id);
//       if (!deleted) {
//         const error = new NotFoundError('User not found');
//         throw error;
//       }
//       res.status(200).json({ message:'User deleted' });
//     }catch(e){
//       next(e);
//     }
//     });
//   }
//   getRouter(): Router {
//     return this.router;
//   }
// }

import { Router, Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { DependencyKeys } from '../constant';
import { IUserService } from '../contracts/IUserService';
import { UserRequest, LoginRequest, ValidationError } from '../models/UserModel';

@injectable()
export class UserRoutes {
  private router: Router;
  private userService: IUserService;
  private jwtPrivateKey: string;

  constructor(@inject(DependencyKeys.UserService) userService: IUserService) {
    this.router = Router();
    this.userService = userService;
    this.jwtPrivateKey = fs.readFileSync(path.resolve('keys/private.pem'), 'utf8');
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public route: Register a new user
    this.router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userRequest = UserRequest.fromJson(req.body);
        const userResponse = await this.userService.createUserAsync(userRequest);
        res.status(201).json({
          id: userResponse.id,
          firstname: userResponse.firstname,
          lastname: userResponse.lastname,
          email: userResponse.email,
          age: userResponse.age,
          hashedPassword: userResponse.hashedPassword
        });
      } catch (error) {
        next(error);
      }
    });

    // Public route: Login to generate a JWT token
    this.router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const loginRequest = LoginRequest.fromJson(req.body);
        const { email, password } = loginRequest;

        const user = await this.userService.findUserAsync(email);
        if(!user){
           throw new ValidationError("not a valid email");
        }
        if (!user.hashedPassword) {
           res.status(401).json({ message: 'Invalid password' });
        }

        // Compare the provided password with the stored hashed password
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
           res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const payload = {
          userId: user.id,
          email: user.email,
          isAdmin: email === 'admin@demo.com', // hardcoded assigned only one email id user to admin for restriced admin route 
        };
        const token = jwt.sign(payload, this.jwtPrivateKey, { algorithm: 'RS256', expiresIn: '1h' });

        res.status(200).json({ token });
      } catch (error) {
        next(error);
      }
    });

    

    // Routes accessible to authenticated users
    this.router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this.userService.getAllAsync(page, limit);
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    });

    this.router.get('/user/:id', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const user = await this.userService.getUserAsync(id);
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        res.status(200).json({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          age: user.age,
        });
      } catch (error) {
        next(error);
      }
    });

    // Routes restricted to admin users
    this.router.post('/user', this.requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userRequest = UserRequest.fromJson(req.body);
        const userResponse = await this.userService.createUserAsync(userRequest);
        res.status(201).json({
          id: userResponse.id,
          firstname: userResponse.firstname,
          lastname: userResponse.lastname,
          email: userResponse.email,
          age: userResponse.age,
        });
      } catch (error) {
        next(error);
      }
    });

    this.router.put('/user/:id', this.requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const userRequest = UserRequest.fromJson(req.body);
        const updated = await this.userService.updateUserAsync(id, userRequest);
        if (!updated) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        res.status(200).json({ message: 'User updated successfully' });
      } catch (error) {
        next(error);
      }
    });

    this.router.delete('/user/:id', this.requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const deleted = await this.userService.deleteUserAsync(id);
        if (!deleted) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        next(error);
      }
    });
  }

  private requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.context.isAdmin) {
     res.status(403).json({ message: 'Admin access required' });
     return;
    }
    next();
  }

  getRouter(): Router {
    return this.router;
  }
}