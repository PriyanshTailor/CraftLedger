import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('ProductCategory', productCategorySchema);
