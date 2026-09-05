import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  movementType: { 
    type: String, 
    enum: ['purchase', 'sale', 'adjustment_in', 'adjustment_out', 'return_in', 'return_out'], 
    required: true 
  },
  quantity: { type: Number, required: true }, // positive or negative depending on context, though typically store absolute and use movementType
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  referenceType: { type: String, enum: ['PurchaseOrder', 'SalesOrder', 'InventoryAdjustment', 'Manual'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('StockMovement', stockMovementSchema);
