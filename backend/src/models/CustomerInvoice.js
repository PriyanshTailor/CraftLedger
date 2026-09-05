import mongoose from 'mongoose';

const customerInvoiceSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  invoiceNumber: { type: String, required: true },
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

customerInvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

export default mongoose.model('CustomerInvoice', customerInvoiceSchema);
