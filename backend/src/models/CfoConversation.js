import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  question: {
    type: String
  },
  answer: {
    type: mongoose.Schema.Types.Mixed
  },
  intent: {
    type: String
  },
  period: {
    type: Object
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const cfoConversationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Financial Advisory Session'
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for tenant-user query performance
cfoConversationSchema.index({ businessId: 1, userId: 1, conversationId: 1 }, { unique: true });

export default mongoose.model('CfoConversation', cfoConversationSchema);
