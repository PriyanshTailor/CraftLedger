import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true, index: true },
  contractNumber: { type: String, required: true },
  contractType: { type: String, default: 'service' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  paymentTerms: String,
  creditLimit: { type: Number, default: 0 },
  agreedTerms: String,
  billingAddress: String,
  shippingAddress: String,
  attachmentUrl: String,
  status: { type: String, enum: ['draft', 'active', 'expired', 'cancelled'], default: 'active' },
}, { timestamps: true });

contractSchema.index({ businessId: 1, contractNumber: 1 }, { unique: true });
export default mongoose.model('Contract', contractSchema);
