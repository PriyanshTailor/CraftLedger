import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  accountCode: { type: String, required: true },
  accountName: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['asset', 'liability', 'equity', 'income', 'expense'], 
    required: true 
  },
  parentAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure accountCode is unique within a business
accountSchema.index({ businessId: 1, accountCode: 1 }, { unique: true });

export default mongoose.model('Account', accountSchema);
