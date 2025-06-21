import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

import prisma from '@/database/db.prisma.js';
import { HttpStatusCodes } from '@/constants/index.js';
import {
  SignUpPayload,
  SignUpSchema,
  LoginPayload,
  LoginSchema,
} from '@/interfaces/user.interfaces.js';

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const result = SignUpSchema.safeParse(req.body);
  if (!result.success) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: result.error.issues,
    });
  }

  const { name, email, password, passwordConfirm } = req.body as SignUpPayload;
  if (password !== passwordConfirm) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
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

  const signOptions: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN };
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET as Secret, signOptions);

  res.status(HttpStatusCodes.CREATED).json({
    status: 'success',
    user: newUser,
    token,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginPayload;

  if (!email || !password) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please provide email and password',
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  const signOptions: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN };
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as Secret, signOptions);

  res.status(HttpStatusCodes.OK).json({
    status: 'success',
    user,
    token,
  });
});
