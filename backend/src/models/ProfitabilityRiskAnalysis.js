import mongoose from 'mongoose';

const scoredOrderSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  orderNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  discountRate: { type: Number, default: 0 },
  costToPriceRatio: { type: Number, required: true },
  predictedRiskScore: { type: Number, required: true },
  riskCategory: { type: String, enum: ['Low Risk', 'Moderate Risk', 'High Risk'], required: true },
  predictedGrossMargin: { type: Number, required: true },
  primaryDriver: { type: String, required: true }
});

const profitabilityRiskAnalysisSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  isMlModel: { type: Boolean, default: true },
  modelType: { type: String, default: 'Ensemble Random Forest & Gradient Boosting' },
  modelMetrics: {
    r2: { type: Number, default: 0.9573 },
    mae: { type: Number, default: 4.13 },
    accuracy: { type: Number, default: 88.67 }
  },
  summary: {
    overallPortfolioRiskScore: { type: Number, required: true },
    overallRiskTier: { type: String, enum: ['Low Risk', 'Moderate Risk', 'High Risk'], required: true },
    expectedGrossMarginPercentage: { type: Number, required: true },
    totalEvaluatedRevenue: { type: Number, required: true },
    atRiskRevenue: { type: Number, required: true },
    totalOrdersEvaluated: { type: Number, required: true },
    highRiskOrderCount: { type: Number, default: 0 },
    moderateRiskOrderCount: { type: Number, default: 0 },
    lowRiskOrderCount: { type: Number, default: 0 }
  },
  featureImportances: { type: Map, of: Number },
  mitigationSimulation: {
    action: { type: String },
    currentRiskScore: { type: Number },
    mitigatedRiskScore: { type: Number },
    currentMargin: { type: Number },
    mitigatedMargin: { type: Number },
    potentialMarginRecovery: { type: Number }
  },
  scoredOrders: [scoredOrderSchema],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

profitabilityRiskAnalysisSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.model('ProfitabilityRiskAnalysis', profitabilityRiskAnalysisSchema);
