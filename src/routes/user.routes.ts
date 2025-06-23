import express from 'express';

// Controllers
import { getAllUsers, getUserById } from '@/controllers/user.controllers.js';
import { signUp, login, protect } from '@/controllers/auth.controllers.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.get('/', protect, getAllUsers);

router.get('/:id', getUserById);

export default router;
