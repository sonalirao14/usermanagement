import { UserRequest, UserResponse } from '../models/UserModel';

export interface IUserService {
  createUser(user: UserRequest): Promise<UserResponse>;
  getUser(id: string): Promise<UserResponse | null>;
  getAll(): Promise<UserResponse[]>;
  updateUser(id: string, user: UserRequest): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
}