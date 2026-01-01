import asyncHandler from "express-async-handler";
import Category from "../Models/Categories.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name_ar, name_fr } = req.body;

  if (!name_ar || !name_fr) {
    res.status(400);
    throw new Error("Both Arabic and French names are required");
  }

  const categoryExists = await Category.findOne({
    $or: [{ name_ar }, { name_fr }]
  });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists in one of the languages");
  }

  const category = await Category.create({
    name_ar: name_ar.trim(),
    name_fr: name_fr.trim(),
  });

  res.status(201).json(category);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .sort({ name_ar: 1 }) // or sort by lang if you want
    .lean();

  // return both names
  const formatted = categories.map(cat => ({
    _id: cat._id,
    name_ar: cat.name_ar,
    name_fr: cat.name_fr,
  }));

  res.status(200).json(formatted);
});


export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Categories.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await Categories.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Category removed" });
});
