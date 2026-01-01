import asyncHandler from 'express-async-handler';
import SocialMedia from '../Models/SocialMedia.js';

// GET all social media links (public)
export const getSocialLinks = asyncHandler(async (req, res) => {
  const links = await SocialMedia.find({ isActive: true })
    .select('platform url icon')
    .sort({ platform: 1 });

  res.json(links);
});

// GET all (including inactive) - for admin panel
export const getAllSocialLinksAdmin = asyncHandler(async (req, res) => {
  const links = await SocialMedia.find().sort({ platform: 1 });
  res.json(links);
});

// UPDATE a social link (admin only)
export const updateSocialLink = asyncHandler(async (req, res) => {
  const { platform, url, icon, isActive } = req.body;

  if (!platform || !url) {
    res.status(400);
    throw new Error('Platform and URL are required');
  }

  // Basic URL validation
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(url)) {
    res.status(400);
    throw new Error('URL must start with http:// or https://');
  }

  const updatedLink = await SocialMedia.findOneAndUpdate(
    { platform },
    { url: url.trim(), icon, isActive: isActive ?? true },
    { new: true, upsert: true, runValidators: true } // creates if not exists
  );

  res.json({
    message: 'Social link updated successfully',
    link: updatedLink,
  });
});

// DELETE a social link (admin only)
export const deleteSocialLink = asyncHandler(async (req, res) => {
  const { platform } = req.params;

  const link = await SocialMedia.findOneAndDelete({ platform });

  if (!link) {
    res.status(404);
    throw new Error('Social link not found');
  }

  res.json({ message: 'Social link deleted successfully' });
});