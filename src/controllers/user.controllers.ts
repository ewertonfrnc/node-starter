import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import prisma from '@/database/db.prisma.js';
import { HttpStatusCodes } from '@/constants/index.js';
import { catchAsync } from '@/utils/catch-async.utils.js';
import { SignUpPayload, SignUpSchema, LoginPayload } from '@/interfaces/user.interfaces.js';
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
  const { email, password } = req.body as LoginPayload;

  if (!email || !password) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please provide email and password',
    });
  }

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

export const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  return res.status(HttpStatusCodes.OK).json({
    status: 'success',
    users,
    results: users.length,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new AppError('User not found', HttpStatusCodes.NOT_FOUND));
  }

  return res.status(HttpStatusCodes.OK).json({
    status: 'success',
    user,
  });
});
