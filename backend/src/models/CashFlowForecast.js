import mongoose from 'mongoose';

const dailyPointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  day: { type: String, required: true },
  dayName: { type: String, required: true },
  projectedBalance: { type: Number, required: true },
  predictedInflow: { type: Number, default: 0 },
  predictedOutflow: { type: Number, default: 0 },
  netCashFlow: { type: Number, default: 0 },
  lowerBound: { type: Number, default: 0 },
  upperBound: { type: Number, default: 0 }
}, { _id: false });

const weeklyPeriodSchema = new mongoose.Schema({
  week: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalInflow: { type: Number, default: 0 },
  totalOutflow: { type: Number, default: 0 },
  netFlow: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 }
}, { _id: false });

const cashFlowForecastSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  horizonDays: { type: Number, required: true, default: 30 },
  currentCash: { type: Number, required: true, default: 0 },
  projectedCash: { type: Number, required: true, default: 0 },
  expectedInflows: { type: Number, required: true, default: 0 },
  expectedOutflows: { type: Number, required: true, default: 0 },
  netCashChange: { type: Number, default: 0 },
  confidenceIndicator: { type: String, default: '79.4% (XGBoost R²)' },
  confidenceScore: { type: Number, default: 79.4 },
  cashShortageWarning: { type: Boolean, default: false },
  summary: {
    startingCash: { type: Number, default: 0 },
    projectedClosingCash: { type: Number, default: 0 },
    netCashChange: { type: Number, default: 0 },
    totalProjectedInflows: { type: Number, default: 0 },
    totalProjectedOutflows: { type: Number, default: 0 },
    lowestProjectedCash: { type: Number, default: 0 },
    lowestCashDate: { type: String, default: '' },
    highestProjectedCash: { type: Number, default: 0 },
    highestCashDate: { type: String, default: '' },
    cashShortageWarning: { type: Boolean, default: false },
    confidenceScore: { type: Number, default: 79.4 },
    runwayDays: { type: Number, default: 45 },
    modelType: { type: String, default: 'XGBoost Multi-Horizon Ensemble' }
  },
  dailyForecast: [dailyPointSchema],
  weeklyBreakdown: [weeklyPeriodSchema],
  isMlModel: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

cashFlowForecastSchema.index({ businessId: 1, horizonDays: 1 });

export default mongoose.models.CashFlowForecast || mongoose.model('CashFlowForecast', cashFlowForecastSchema);
