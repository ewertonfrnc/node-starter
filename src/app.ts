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
import { NodeEnvironments } from './constants/index.js';

const app = express();

// Middlewares
if (process.env.NODE_ENV === NodeEnvironments.DEVELOPMENT) {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use('/api/v1/resource', resourceRouter);
app.use('/api/v1/users', userRouter);

export default app;
