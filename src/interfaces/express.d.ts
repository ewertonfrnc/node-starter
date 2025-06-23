import { Request } from 'express';
import { User } from '../../generated/prisma/client.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
