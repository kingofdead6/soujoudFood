// routes/auth.js
import express from 'express';
import { register, login, registerSuperAdmin } from '../Controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-superadmin', registerSuperAdmin);
export default router;