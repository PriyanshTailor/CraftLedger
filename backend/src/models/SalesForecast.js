import mongoose from 'mongoose';

const dailySalesPointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  day: { type: String, required: true },
  dayName: { type: String, required: true },
  predictedSales: { type: Number, required: true },
  predictedOrders: { type: Number, default: 1 },
  lowerBound: { type: Number, default: 0 },
  upperBound: { type: Number, default: 0 }
}, { _id: false });

const weeklySalesPeriodSchema = new mongoose.Schema({
  week: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  averageDailySales: { type: Number, default: 0 }
}, { _id: false });

const salesForecastSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  horizonDays: { type: Number, required: true, default: 30 },
  projectedTotalRevenue: { type: Number, required: true, default: 0 },
  projectedOrdersCount: { type: Number, required: true, default: 0 },
  averageDailySales: { type: Number, required: true, default: 0 },
  projectedGrowthRate: { type: Number, default: 12.4 },
  confidenceScore: { type: Number, default: 55.4 },
  modelType: { type: String, default: 'Simple Ridge Linear Regression' },
  bestSalesDay: {
    date: String,
    day: String,
    predictedSales: Number
  },
  dailyForecast: [dailySalesPointSchema],
  weeklyBreakdown: [weeklySalesPeriodSchema],
  isMlModel: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

salesForecastSchema.index({ businessId: 1, horizonDays: 1 });

export default mongoose.models.SalesForecast || mongoose.model('SalesForecast', salesForecastSchema);
