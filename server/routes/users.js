import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../Controllers/User.js';
import { protect, superadmin } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', protect, superadmin, getUsers);
router.post('/', protect, superadmin, createUser);
router.put('/:id', protect, superadmin, updateUser);
router.delete('/:id', protect, superadmin, deleteUser);

export default router;