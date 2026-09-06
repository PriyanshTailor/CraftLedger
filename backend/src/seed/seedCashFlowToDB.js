import mongoose from 'mongoose';
import User from '../models/User.js';
import CashFlowForecast from '../models/CashFlowForecast.js';
import { calculateCashFlowForecast } from '../services/intelligenceService.js';

export const seedCashFlowForecasts = async () => {
  const user = await User.findOne({ email: 'vidhitrivedi3110@gmail.com' });
  if (!user?.businessId) {
    throw new Error('Business owner not found.');
  }

  const businessId = user.businessId;
  console.log(`Generating and storing Cash Flow Forecasts in MongoDB for Business: ${businessId}...`);

  const results = {};
  for (const days of [30, 60, 90]) {
    console.log(`Calculating & storing ${days}-Day horizon forecast in MongoDB...`);
    const forecast = await calculateCashFlowForecast(businessId, days);

    // Verify it is in MongoDB
    const doc = await CashFlowForecast.findOne({ businessId, horizonDays: days });
    results[`${days}Days`] = {
      storedInDb: !!doc,
      horizonDays: doc?.horizonDays,
      startingCash: doc?.summary?.startingCash,
      projectedClosingCash: doc?.summary?.projectedClosingCash,
      netCashChange: doc?.summary?.netCashChange,
      dailyPointsCount: doc?.dailyForecast?.length,
      weeklyPeriodsCount: doc?.weeklyBreakdown?.length
    };
  }

  return results;
};

if (process.argv[1].endsWith('seedCashFlowToDB.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    const res = await seedCashFlowForecasts();
    console.log('SUCCESS: Cash Flow Forecast stored in database:');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
}
