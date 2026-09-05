import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional (e.g. system operations)
  role: { type: String },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
