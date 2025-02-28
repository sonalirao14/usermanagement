import { RequestHandler } from 'express';

export const validateUser: RequestHandler = (req, res, next) => {
  const { firstname,lastname,course,email, age } = req.body;
  if (!firstname || !lastname || !course || !email || !age || typeof age !== 'number') {
     res.status(400).json({ error: 'Invalid user data' });
  }
  next();
};