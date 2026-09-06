import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES } from '../config/roles.js';

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  passwordHash:  { type: String, required: true },

  role: {
    type:     String,
    enum:     Object.values(ROLES),
    required: true,
    default:  ROLES.CONTACT
  },

  // Only set for business_owner and below — super_admin has no businessId
  businessId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: false },

  // Only set for customer — links to Contact master record
  contactId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: false },

  permissions:   { type: [String], default: [] },

  isActive:      { type: Boolean, default: true },
  isArchived:    { type: Boolean, default: false },
  archivedAt:    { type: Date, default: null },
  lastLoginAt:   { type: Date },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

export default mongoose.model('User', userSchema);
