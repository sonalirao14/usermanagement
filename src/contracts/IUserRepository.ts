import { UserRequest, UserResponse } from '../models/UserModel';

export interface IUserRepository {
  createUserAsync(user: UserRequest): Promise<UserResponse>;
  getUserAsync(id: string): Promise<UserResponse | null>;
  getAllAsync(): Promise<UserResponse[]>;
  updateUserAsync(id: string, user: UserRequest): Promise<boolean>;
  deleteUserAsync(id: string): Promise<boolean>;
}