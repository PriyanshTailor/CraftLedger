import mongoose from 'mongoose';
import User from '../models/User.js';
import SalesForecast from '../models/SalesForecast.js';
import { calculateSalesForecast } from '../services/intelligenceService.js';

export const seedSalesForecasts = async () => {
  const user = await User.findOne({ email: 'vidhitrivedi3110@gmail.com' });
  if (!user?.businessId) {
    throw new Error('Business owner not found.');
  }

  const businessId = user.businessId;
  console.log(`Generating & storing Sales & Revenue Forecasts in MongoDB for Business: ${businessId}...`);

  const results = {};
  for (const days of [30, 60, 90]) {
    console.log(`Calculating & storing ${days}-Day sales forecast...`);
    const forecast = await calculateSalesForecast(businessId, days);
    const doc = await SalesForecast.findOne({ businessId, horizonDays: days });
    results[`${days}Days`] = {
      storedInDb: !!doc,
      horizonDays: doc?.horizonDays,
      projectedTotalRevenue: doc?.projectedTotalRevenue,
      averageDailySales: doc?.averageDailySales,
      projectedOrdersCount: doc?.projectedOrdersCount,
      dailyPointsCount: doc?.dailyForecast?.length,
      weeklyPeriodsCount: doc?.weeklyBreakdown?.length,
      modelType: doc?.modelType
    };
  }

  return results;
};

if (process.argv[1].endsWith('seedSalesForecastToDB.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    const res = await seedSalesForecasts();
    console.log('SUCCESS: Sales & Revenue Forecast stored in MongoDB:');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
}
