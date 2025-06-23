import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import prisma from '@/database/db.prisma.js';
import { HttpStatusCodes } from '@/constants/index.js';
import { catchAsync } from '@/utils/catch-async.utils.js';
import {
  LoginPayload,
  LoginSchema,
  SignUpPayload,
  SignUpSchema,
} from '@/interfaces/user.interfaces.js';
import AppError from '@/utils/app-error.utils.js';

const signToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as Secret, {
    expiresIn: '90d',
  });
};

export const signUp = catchAsync(async (req: Request, res: Response) => {
  const result = SignUpSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      status: 'fail',
      errors: result.error.issues,
    });
  }

  const { name, email, password, passwordConfirm } = req.body as SignUpPayload;
  if (password !== passwordConfirm) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: 'Passwords do not match',
    });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      passwordConfirm: '',
    },
  });

  const token = signToken(newUser.id);

  return res.status(HttpStatusCodes.CREATED).json({
    status: 'success',
    user: newUser,
    token,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please provide email and password',
    });
  }

  const { email, password } = result.data as LoginPayload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  const token = signToken(user.id);

  return res.status(HttpStatusCodes.OK).json({
    status: 'success',
    token,
  });
});

export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  // Get token and check if it exists
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization?.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in!', HttpStatusCodes.UNAUTHORIZED));
  } // Verify token
  let decoded: JwtPayload;

  decoded = await new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as Secret, (err, payload) => {
      if (err) return reject(err);
      resolve(payload as JwtPayload);
    });
  });

  // Check if user still exists
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        HttpStatusCodes.UNAUTHORIZED,
      ),
    );
  }

  //   Check if user changed password after the token was issued
  if (currentUser.passwordChangedAt) {
    const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);

    if (decoded.iat && decoded.iat < changedTimestamp) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          HttpStatusCodes.UNAUTHORIZED,
        ),
      );
    }
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});
