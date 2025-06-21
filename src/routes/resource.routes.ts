import express from 'express';
import {
  getAllResource,
  getResourceById,
  createResource,
} from '@/controllers/resource.controllers.js';

const router = express.Router();

router.route('/').get(getAllResource).post(createResource);
router.route('/:id').get(getResourceById);

export default router;
