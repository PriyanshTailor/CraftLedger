import mongoose from 'mongoose';

const analyticAccountSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure code is unique within a business
analyticAccountSchema.index({ businessId: 1, code: 1 }, { unique: true });

export default mongoose.model('AnalyticAccount', analyticAccountSchema);
