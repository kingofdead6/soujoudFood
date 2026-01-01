import express from 'express';
import {
  getSocialLinks,
  getAllSocialLinksAdmin,
  updateSocialLink,
  deleteSocialLink,
} from '../Controllers/socialMedia.js';
import { protect, admin } from '../Middleware/auth.js';

const router = express.Router();

// Public route - get active social links (used on frontend)
router.get('/', getSocialLinks);

// Admin routes
router.get('/admin', protect, admin, getAllSocialLinksAdmin);

router.put('/:platform', protect, admin, updateSocialLink); // e.g., PUT /instagram

router.delete('/:platform', protect, admin, deleteSocialLink);

export default router;