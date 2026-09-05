import mongoose from 'mongoose';

const inventoryAdjustmentItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  adjustmentType: { type: String, enum: ['increase', 'decrease'], required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  unitCost: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true }
});

const inventoryAdjustmentSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  adjustmentNumber: { type: String, required: true, index: true },
  date: { type: Date, required: true, default: Date.now },
  items: [inventoryAdjustmentItemSchema],
  totalValueChange: { type: Number, required: true }, // positive or negative
  status: { type: String, enum: ['draft', 'approved', 'cancelled'], default: 'draft' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

inventoryAdjustmentSchema.index({ businessId: 1, adjustmentNumber: 1 }, { unique: true });

export default mongoose.model('InventoryAdjustment', inventoryAdjustmentSchema);
