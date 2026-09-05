import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  legalName: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  currency: { type: String, default: 'INR' },
  taxNumber: { type: String },
  logo: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Business', businessSchema);
