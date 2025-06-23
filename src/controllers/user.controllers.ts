import { NextFunction, Request, Response } from 'express';

import prisma from '@/database/db.prisma.js';
import { HttpStatusCodes } from '@/constants/index.js';
import { catchAsync } from '@/utils/catch-async.utils.js';

import AppError from '@/utils/app-error.utils.js';

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
