import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  journalType: { 
    type: String, 
    enum: ['sales', 'purchase', 'cash', 'bank', 'general'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure code is unique within a business
journalSchema.index({ businessId: 1, code: 1 }, { unique: true });

export default mongoose.model('Journal', journalSchema);
