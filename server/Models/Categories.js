import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name_ar: { type: String, required: true, trim: true },
  name_fr: { type: String, required: true, trim: true },
}, { timestamps: true });

categorySchema.virtual('name').get(function () {
  return this.name_ar; 
});

export default mongoose.model('Category', categorySchema);