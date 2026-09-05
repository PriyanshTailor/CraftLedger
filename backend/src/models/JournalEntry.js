import mongoose from 'mongoose';

const journalEntryLineSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  accountNameSnapshot: { type: String, required: true },
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },
  description: { type: String }
});

const journalEntrySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  entryNumber: { type: String, required: true, index: true },
  entryDate: { type: Date, required: true, default: Date.now },
  journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
  referenceType: { type: String }, // e.g., 'CustomerInvoice', 'VendorBill', 'Manual'
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String, required: true },
  lines: [journalEntryLineSchema],
  totalDebit: { type: Number, required: true, min: 0 },
  totalCredit: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['draft', 'posted', 'reversed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

journalEntrySchema.index({ businessId: 1, entryNumber: 1 }, { unique: true });

export default mongoose.model('JournalEntry', journalEntrySchema);
