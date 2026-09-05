import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  contactType: { type: String, enum: ['customer', 'vendor', 'customer_and_vendor'], required: true, index: true },
  name: { type: String, required: true, index: true },
  email: { type: String, index: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  taxNumber: { type: String },
  openingBalance: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 0 },
  paymentTerms: { type: String },
  hasLoginAccess: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
