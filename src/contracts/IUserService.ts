import { UserRequest} from '../models/userRequest';
import { UserResponse } from '../models/userResponse';
import { UpdateUserRequest } from '../models/UpdateUserReq';

export interface IUserService {
  createUserAsync(user: UserRequest): Promise<UserResponse>;
  getUserAsync(id: string): Promise<UserResponse | null>;
  findUserAsync(email: string): Promise<UserResponse | null>;
  getAllAsync(page: number, limit: number): Promise<{ data: UserResponse[], pagination: { total: number, page: number, limit: number, totalPages: number } }>;
  updateUserAsync(id: string, user: UpdateUserRequest): Promise<boolean>;
  deleteUserAsync(id: string): Promise<boolean>;
  deleteUsersAsync(emails: string[]): Promise<{deletedCount: Number, notFoundEmails:string[]}>
}