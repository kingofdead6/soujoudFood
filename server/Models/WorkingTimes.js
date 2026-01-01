import mongoose from 'mongoose';

const workingTimesSchema = new mongoose.Schema({ 
  open: {  type: String,  default: null},
  close: { type: String, default: null}
}, {
  timestamps: true,
});

export default mongoose.model('workingTimes', workingTimesSchema);