import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name_ar: { type: String, required: true },
  name_fr: { type: String, required: true },
  description_ar: { type: String },
  description_fr: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category_ar: { type: String, required: true },   
  category_fr: { type: String, required: true },   
  showOnMainPage: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);