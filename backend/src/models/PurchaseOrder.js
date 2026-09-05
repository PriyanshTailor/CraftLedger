import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productNameSnapshot: { type: String, required: true },
  skuSnapshot: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  purchaseOrderNumber: { type: String, required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  orderDate: { type: Date, required: true, default: Date.now },
  expectedDeliveryDate: { type: Date },
  items: [purchaseOrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'confirmed', 'partially_received', 'received', 'cancelled'], 
    default: 'draft' 
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure unique PO number per business
purchaseOrderSchema.index({ businessId: 1, purchaseOrderNumber: 1 }, { unique: true });

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
