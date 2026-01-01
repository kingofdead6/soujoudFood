import express from 'express';
import {
  getWorkingTimes,
  updateWorkingTimes,
} from '../Controllers/workingtimes.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', getWorkingTimes);

router.patch('/', protect, admin, updateWorkingTimes);

export default router;