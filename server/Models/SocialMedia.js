import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'facebook', 'whatsapp', 'tiktok', 'twitter', 'youtube', 'linkedin'],
    unique: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String, 
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model('SocialMedia', socialMediaSchema);