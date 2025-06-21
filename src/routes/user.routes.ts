import express from 'express';

// Controllers
import { signUp } from '@/controllers/user.controllers.js';

const router = express.Router();

router.post('/signup', signUp);

export default router;
