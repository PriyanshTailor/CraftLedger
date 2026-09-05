import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  analyticAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticAccount' },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  plannedAmount: { type: Number, required: true, min: 0 },
  actualAmount: { type: Number, default: 0 },
  varianceAmount: { type: Number, default: 0 },
  variancePercentage: { type: Number, default: 0 },
  responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
