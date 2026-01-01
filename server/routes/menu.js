import express from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleShowOnMainPage,
  getAdminMenuItems,
} from '../Controllers/menu.js';
import { protect, admin } from '../Middleware/auth.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or WebP images are allowed'), false);
    }
  },
});

const router = express.Router();

// Public routes
router.get('/', getMenuItems); 

// Admin-only routes
router.get('/admin-menu', protect, admin, getAdminMenuItems);
router.post('/', protect, admin, upload.single('image'), createMenuItem);
router.put('/:id', protect, admin, upload.single('image'), updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);
router.patch('/:id/toggle-visibility', protect, admin, toggleShowOnMainPage);

export default router;