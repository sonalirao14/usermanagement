import { Router } from 'express';
import { injectable, inject } from 'inversify';
import { IUserService } from '../contracts/IUserService';
import { DependencyKeys } from '../constant';
import { validateUser } from '../middlewares/validateUser';
import { UserRequest } from '../models/UserModel';

@injectable()
export class UserRoutes {
  private router: Router;
  private userService: IUserService;

  constructor(@inject(DependencyKeys.UserService) userService: IUserService) {
    this.router = Router();
    this.userService = userService;
    this.setupRoutes();
  }

  private setupRoutes() {
    // Create a User
    this.router.post('/user', validateUser, async (req, res) => {
      try {
        const user = UserRequest.builder()
          .withName(req.body.firstname)
          .withLastName(req.body.lastname)
          .withcourse(req.body.course)
          .withEmail(req.body.email)
          .withAge(req.body.age)
          .build();
        const result = await this.userService.createUser(user);
        res.status(201).json(result);
      } catch (e) {
        res.status(500).json({e});
      }
    });


    // Get All Users data
    this.router.get('/users', async (req, res) => {
        try {
          const users = await this.userService.getAll();
          res.status(200).json(users);
        } catch (e) {
          res.status(500).json({e});
        }
      });
  
      // Get a single user data based on id
      this.router.get('/user/:id', async (req, res) => {
        try {
          // Validate the ID format (MongoDB ObjectId should be a 24-character hex string)
          const id = req.params.id;
          if (!id.match(/^[0-9a-fA-F]{24}$/)) {
         res.status(400).json({error:'Invalid user ID'});
          }
          const user = await this.userService.getUser(id);
          if (!user) {
          res.status(404).json({message:"User not found"});
          }
          res.status(200).json(user);
        } catch (e) {
          res.status(500).json({e,message:'Failed to fetch user'});
        }
      });

    // Update User data 
    this.router.put('/user/:id', validateUser, async (req, res) => {
      try {
        const user = UserRequest.builder()
          .withName(req.body.firstname)
          .withLastName(req.body.lastname)
          .withcourse(req.body.course)
          .withEmail(req.body.email)
          .withAge(req.body.age)
          .build();
        const updated = await this.userService.updateUser(req.params.id, user);
        if (!updated){
              res.status(404).json({message:'User not exist'});
        }
        res.json({message:'User updated'});
      } catch (error) {
        res.status(500).json({error,message:'Updation failed'});
      }
    });

    // Delete User
    this.router.delete('/user/:id', async (req, res) => {
      try {
        const deleted = await this.userService.deleteUser(req.params.id);
        if (!deleted) {
             res.status(404).json({message:"User not exist"});
        }
        res.json({message:'User deleted'});
      }catch(error){
        res.status(500).json({error,message:'Deletion failed'});
      }
    });
  }

  getRouter(): Router {
    return this.router;
  }
}