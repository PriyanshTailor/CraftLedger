import mongoose from 'mongoose';

const slowMovingItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  categoryName: { type: String, default: 'General' },
  quantityOnHand: { type: Number, required: true },
  reorderLevel: { type: Number, default: 5 },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  tiedUpCapital: { type: Number, required: true },
  annualCarryingCost: { type: Number, required: true },
  projectedHoldingLoss90Days: { type: Number, required: true },

  // Demand metrics
  unitsSold30Days: { type: Number, default: 0 },
  unitsSold60Days: { type: Number, default: 0 },
  unitsSold90Days: { type: Number, default: 0 },
  totalUnitsSold: { type: Number, default: 0 },
  lastSaleDate: { type: Date },
  daysSinceLastSale: { type: Number, default: 999 },
  averageDailyDemand: { type: Number, default: 0 },
  monthlyRunRate: { type: Number, default: 0 },
  daysOfInventoryRemaining: { type: Number, required: true },
  inventoryTurnoverRatio: { type: Number, default: 0 },

  // Rule-based classification
  classification: {
    type: String,
    enum: ['dead_stock', 'slow_moving', 'moderate', 'fast_moving', 'low_stock'],
    required: true
  },
  classificationLabel: { type: String, required: true },
  urgency: { type: String, enum: ['critical', 'high', 'medium', 'low', 'immediate'], default: 'medium' },
  triggeredRule: { type: String, required: true },
  actionRecommendation: { type: String, required: true }
});

const slowMovingAnalysisSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  horizonDays: { type: Number, default: 90 },
  holdingCostRate: { type: Number, default: 0.20 },

  // Aggregates
  totalProductsAnalyzed: { type: Number, required: true },
  totalInventoryValue: { type: Number, required: true },
  deadStockCount: { type: Number, default: 0 },
  deadStockValue: { type: Number, default: 0 },
  slowMovingCount: { type: Number, default: 0 },
  slowMovingValue: { type: Number, default: 0 },
  moderateCount: { type: Number, default: 0 },
  moderateValue: { type: Number, default: 0 },
  healthyCount: { type: Number, default: 0 },
  healthyValue: { type: Number, default: 0 },
  lowStockCount: { type: Number, default: 0 },

  totalAtRiskCapital: { type: Number, required: true },
  annualCarryingCostWaste: { type: Number, required: true },
  projectedQuarterlyLoss: { type: Number, required: true },
  averageDaysOfInventory: { type: Number, default: 0 },

  // Products analyzed
  items: [slowMovingItemSchema],

  // AI CFO / Rule-based action directives
  recommendations: [{
    title: { type: String, required: true },
    severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    potentialRecovery: { type: Number, default: 0 },
    message: { type: String, required: true },
    suggestedAction: { type: String, required: true }
  }],

  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

slowMovingAnalysisSchema.index({ businessId: 1, horizonDays: 1 });

export default mongoose.model('SlowMovingAnalysis', slowMovingAnalysisSchema);
