import express from 'express';

// Controllers
import { signUp, login, getAllUsers, getUserById } from '@/controllers/user.controllers.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.get('/', getAllUsers);

router.get('/:id', getUserById);

export default router;
