import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  entityName: { type: String, required: true }, // 'SalesOrder', 'CustomerInvoice', 'CustomerPayment'
  sequenceValue: { type: Number, default: 0 }
});

sequenceSchema.index({ businessId: 1, entityName: 1 }, { unique: true });

export default mongoose.model('Sequence', sequenceSchema);
