import { RequestHandler , NextFunction } from 'express';
import { ValidationError } from '../models/UserModel';
export const validateUser: RequestHandler = (req, res, next) => {
  const { firstname,lastname,course,email, age } = req.body;
  // if (!firstname || !lastname || !course || !email || !age || typeof age !== 'number') {
  //   throw new ValidationError('Invalid user data: name, email, and age are required, and age must be a number');
  // }
  const errors: string[] = [];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!firstname) {
    errors.push("Firstname is missing");
  }
  if (!lastname) {
    errors.push("Last name is missing");
  }
  if (!course) {
    errors.push("Course is missing");
  }
  if (!email || !emailRegex.test(email)) {
    errors.push("Email is not valid");
  }
  if (!age || typeof age !== 'number') {
    errors.push("Age is not valid");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
  console.log('Validation passed, proceeding to route handler');
  next();
};