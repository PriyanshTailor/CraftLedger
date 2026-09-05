import mongoose from 'mongoose';

const customerPaymentSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  paymentNumber: { type: String, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerInvoice', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other', 'simulated_upi', 'simulated_card', 'simulated_net_banking', 'simulated_bank_transfer'],
    required: true
  },
  referenceNumber: { type: String },
  paymentMode: { type: String, enum: ['simulation', 'manual'], default: 'manual' },
  status: { type: String, enum: ['pending', 'successful', 'failed', 'cancelled'], default: 'successful' },
  transactionReference: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

customerPaymentSchema.index({ businessId: 1, paymentNumber: 1 }, { unique: true });

export default mongoose.model('CustomerPayment', customerPaymentSchema);
