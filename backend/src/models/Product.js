import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', index: true },
  name: { type: String, required: true, index: true },
  sku: { type: String, required: true, index: true },
  description: { type: String },
  unit: { type: String },
  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 },
  quantityOnHand: { type: Number, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 0, min: 0 },
  inventoryValue: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure SKU is unique within a business
productSchema.index({ businessId: 1, sku: 1 }, { unique: true });

export default mongoose.model('Product', productSchema);
