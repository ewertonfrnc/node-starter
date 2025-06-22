import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

// Importing routes
import resourceRouter from './routes/resource.routes.js';
import userRouter from './routes/user.routes.js';

// Importing constants
import { HttpStatusCodes, NodeEnvironments } from './constants/index.js';

// Importing custom error class
import AppError from '@/utils/app-error.utils.js';
import GlobalErrorHandler from '@/controllers/error.controllers.js';

const app = express();

// Middlewares
if (process.env.NODE_ENV === NodeEnvironments.DEVELOPMENT) {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use('/api/v1/resource', resourceRouter);
app.use('/api/v1/users', userRouter);

// Catch-all route for undefined routes
app.all('/*splat', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, HttpStatusCodes.NOT_FOUND));
});

app.use(GlobalErrorHandler);

export default app;
