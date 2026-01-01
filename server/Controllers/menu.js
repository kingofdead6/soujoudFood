import asyncHandler from 'express-async-handler';
import Menu from '../Models/Menu.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getAdminMenuItems = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};

  const menuItems = await Menu.find(query).sort({ category: 1, name: 1 }).lean();
  res.status(200).json(menuItems);
});

export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, lang = 'ar' } = req.query; // add lang query param

  const query = { showOnMainPage: true };

  if (category && category !== 'All') {
    const field = lang === 'fr' ? 'category_fr' : 'category_ar';
    query[field] = category;
  }

  const menuItems = await Menu.find(query)
    .sort({ 
      [lang === 'fr' ? 'category_fr' : 'category_ar']: 1,
      [lang === 'fr' ? 'name_fr' : 'name_ar']: 1 
    })
    .lean();

  // Format response to show only selected language
  const formattedItems = menuItems.map(item => ({
    _id: item._id,
    name: lang === 'fr' ? item.name_fr : item.name_ar,
    description: lang === 'fr' ? item.description_fr : item.description_ar,
    price: item.price,
    image: item.image,
    category: lang === 'fr' ? item.category_fr : item.category_ar,
  }));

  res.status(200).json(formattedItems);
});

// Also update createMenuItem & updateMenuItem to accept bilingual fields
export const createMenuItem = asyncHandler(async (req, res) => {
  const {
    name_ar, name_fr,
    description_ar, description_fr,
    price, category_ar, category_fr,
    showOnMainPage
  } = req.body;

  if (!name_ar || !name_fr || !price || !category_ar || !category_fr) {
    res.status(400);
    throw new Error('All required bilingual fields must be provided');
  }

  let image = '';
  if (req.file) {
    image = await uploadToCloudinary(req.file);
  } else {
    res.status(400);
    throw new Error('Menu item image is required');
  }

  const menuItem = await Menu.create({
    name_ar: name_ar.trim(),
    name_fr: name_fr.trim(),
    description_ar: description_ar?.trim() || '',
    description_fr: description_fr?.trim() || '',
    price: Number(price),
    category_ar: category_ar.trim(),
    category_fr: category_fr.trim(),
    image,
    showOnMainPage: showOnMainPage === 'true' || showOnMainPage === true,
  });

  res.status(201).json(menuItem);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, showOnMainPage } = req.body;

  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  if (name !== undefined) menuItem.name = name.trim();
  if (description !== undefined) menuItem.description = description.trim();
  if (price !== undefined) menuItem.price = Number(price);
  if (category !== undefined) menuItem.category = category.trim();
  if (showOnMainPage !== undefined) {
    menuItem.showOnMainPage = showOnMainPage === 'true' || showOnMainPage === true;
  }

  if (req.file) {
    menuItem.image = await uploadToCloudinary(req.file);
  }

  const updatedMenuItem = await menuItem.save();
  res.status(200).json(updatedMenuItem);
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  await Menu.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Menu item deleted successfully' });
});

export const toggleShowOnMainPage = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  menuItem.showOnMainPage = !menuItem.showOnMainPage;
  await menuItem.save();

  res.status(200).json(menuItem);
});

