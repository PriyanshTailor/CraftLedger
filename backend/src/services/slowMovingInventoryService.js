import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import SalesOrder from '../models/SalesOrder.js';
import StockMovement from '../models/StockMovement.js';
import SlowMovingAnalysis from '../models/SlowMovingAnalysis.js';

/**
 * Completely Rule-Based Slow-Moving Inventory Prediction Engine
 * Evaluates stock run-out, demand velocity, turnover ratio, and capital at risk.
 *
 * @param {string|ObjectId} businessId
 * @param {Object} options
 * @returns {Promise<Object>} Analysis results and itemized classifications
 */
export const calculateSlowMovingInventory = async (businessId, options = {}) => {
  const horizonDays = parseInt(options.horizonDays) || 90;
  const holdingCostRate = parseFloat(options.holdingCostRate) || 0.20; // 20% annual carrying cost

  // 1. Fetch active catalog products
  const products = await Product.find({ businessId, isActive: true })
    .populate('categoryId', 'name')
    .lean();

  if (!products || products.length === 0) {
    return {
      businessId,
      horizonDays,
      totalProductsAnalyzed: 0,
      totalInventoryValue: 0,
      deadStockCount: 0,
      deadStockValue: 0,
      slowMovingCount: 0,
      slowMovingValue: 0,
      moderateCount: 0,
      moderateValue: 0,
      healthyCount: 0,
      healthyValue: 0,
      lowStockCount: 0,
      totalAtRiskCapital: 0,
      annualCarryingCostWaste: 0,
      projectedQuarterlyLoss: 0,
      averageDaysOfInventory: 0,
      items: [],
      recommendations: []
    };
  }

  // 2. Fetch sales orders to quantify demand velocity
  const salesOrders = await SalesOrder.find({
    businessId,
    status: { $ne: 'cancelled' }
  }).lean();

  // 3. Fetch stock movements to track non-sales adjustments or production consumption
  const stockMovements = await StockMovement.find({ businessId }).lean();

  // Build timeline boundaries
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Map historical demand by productId
  const demandMap = {};
  for (const so of salesOrders) {
    const oDate = new Date(so.orderDate || so.createdAt);
    for (const item of (so.items || [])) {
      const pId = String(item.productId);
      if (!demandMap[pId]) {
        demandMap[pId] = {
          qty30: 0,
          qty60: 0,
          qty90: 0,
          totalQty: 0,
          lastDate: oDate,
          orderCount: 0
        };
      }
      const dm = demandMap[pId];
      const q = item.quantity || 0;
      dm.totalQty += q;
      dm.orderCount += 1;
      if (oDate >= d30) dm.qty30 += q;
      if (oDate >= d60) dm.qty60 += q;
      if (oDate >= d90) dm.qty90 += q;
      if (oDate > dm.lastDate) dm.lastDate = oDate;
    }
  }

  // Also factor in production / material consumption from StockMovement for raw materials
  const movementMap = {};
  for (const mv of stockMovements) {
    const pId = String(mv.productId);
    if (!movementMap[pId]) {
      movementMap[pId] = { totalOut: 0, lastMovementDate: new Date(mv.createdAt) };
    }
    if (['sale', 'adjustment_out', 'return_out'].includes(mv.movementType)) {
      movementMap[pId].totalOut += Math.abs(mv.quantity || 0);
    }
    if (new Date(mv.createdAt) > movementMap[pId].lastMovementDate) {
      movementMap[pId].lastMovementDate = new Date(mv.createdAt);
    }
  }

  // 4. Evaluate each product against rule-based demand criteria
  let totalInventoryValue = 0;
  let deadStockCount = 0;
  let deadStockValue = 0;
  let slowMovingCount = 0;
  let slowMovingValue = 0;
  let moderateCount = 0;
  let moderateValue = 0;
  let healthyCount = 0;
  let healthyValue = 0;
  let lowStockCount = 0;
  let sumDIR = 0;

  const analyzedItems = products.map(product => {
    const pId = String(product._id);
    const demand = demandMap[pId] || { qty30: 0, qty60: 0, qty90: 0, totalQty: 0, lastDate: null, orderCount: 0 };
    const movements = movementMap[pId] || { totalOut: 0, lastMovementDate: null };

    const stock = product.quantityOnHand || 0;
    const cost = product.costPrice || 0;
    const sell = product.sellingPrice || 0;
    const reorder = product.reorderLevel || 5;
    const tiedUpCapital = stock * cost;
    totalInventoryValue += tiedUpCapital;

    // Determine demand in horizon
    let horizonDemand = 0;
    if (horizonDays <= 30) horizonDemand = demand.qty30;
    else if (horizonDays <= 60) horizonDemand = demand.qty60;
    else horizonDemand = demand.qty90;

    // If it's a raw material without direct sales orders, consider stock movement consumption
    if (horizonDemand === 0 && movements.totalOut > 0) {
      horizonDemand = movements.totalOut;
    }

    // Demand Velocity Metrics
    const effectiveDays = Math.max(1, horizonDays);
    const averageDailyDemand = Number((horizonDemand / effectiveDays).toFixed(3));
    const monthlyRunRate = Number((averageDailyDemand * 30).toFixed(1));

    // Days since last sale / movement
    let daysSinceLastSale = 999;
    if (demand.lastDate) {
      daysSinceLastSale = Math.max(0, Math.floor((now.getTime() - new Date(demand.lastDate).getTime()) / (1000 * 60 * 60 * 24)));
    } else if (movements.lastMovementDate) {
      daysSinceLastSale = Math.max(0, Math.floor((now.getTime() - new Date(movements.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Days of Inventory Remaining (DIR / Run-out time)
    let daysOfInventoryRemaining = 999;
    if (stock <= 0) {
      daysOfInventoryRemaining = 0;
    } else if (averageDailyDemand > 0) {
      daysOfInventoryRemaining = Math.round(stock / averageDailyDemand);
    } else {
      daysOfInventoryRemaining = 999; // Infinite run-out time
    }

    if (daysOfInventoryRemaining < 999) {
      sumDIR += daysOfInventoryRemaining;
    } else {
      sumDIR += 365; // Cap for average calculation
    }

    // Inventory Turnover Ratio (annualized)
    const annualDemandUnits = averageDailyDemand * 365;
    const inventoryTurnoverRatio = stock > 0 ? Number((annualDemandUnits / stock).toFixed(2)) : 0;

    // Carrying cost impact (20% annual standard)
    const annualCarryingCost = Math.round(tiedUpCapital * holdingCostRate);
    const projectedHoldingLoss90Days = Math.round(annualCarryingCost * (90 / 365));

    // -------------------------------------------------------------
    // RULE-BASED CLASSIFICATION ENGINE
    // -------------------------------------------------------------
    let classification = 'healthy';
    let classificationLabel = 'Fast Moving / Healthy';
    let urgency = 'low';
    let triggeredRule = '';
    let actionRecommendation = '';

    if (stock <= reorder && stock > 0) {
      // Rule 5: Low Stock
      classification = 'low_stock';
      classificationLabel = 'Low Stock Alert';
      urgency = 'immediate';
      triggeredRule = `Stock level (${stock}) at or below reorder threshold (${reorder} units).`;
      actionRecommendation = 'Initiate purchase order with preferred supplier to prevent production stockout.';
      lowStockCount++;
      healthyCount++;
      healthyValue += tiedUpCapital;
    } else if (stock > 0 && (horizonDemand === 0 || daysSinceLastSale >= 90 || daysOfInventoryRemaining >= 180)) {
      // Rule 1: Dead Stock (Critical)
      classification = 'dead_stock';
      classificationLabel = 'Dead / Dormant Stock';
      urgency = 'critical';
      triggeredRule = horizonDemand === 0
        ? `Zero demand recorded in past ${horizonDays} days; capital locked without velocity.`
        : `Run-out time exceeds 180 days (${daysOfInventoryRemaining} days) with minimal turnover.`;
      actionRecommendation = 'Apply 30-40% clearance discount, bundle with high-demand products, or return to vendor.';
      deadStockCount++;
      deadStockValue += tiedUpCapital;
    } else if (stock > 0 && daysOfInventoryRemaining > 75 && daysOfInventoryRemaining < 180) {
      // Rule 2: Slow Moving (Warning)
      classification = 'slow_moving';
      classificationLabel = 'Slow Moving Stock';
      urgency = 'high';
      triggeredRule = `Run-out time is ${daysOfInventoryRemaining} days (> 75 days threshold). Daily demand velocity is low (${averageDailyDemand}/day).`;
      actionRecommendation = 'Freeze replenishment purchase orders. Offer 15-20% dealer incentive or showroom spotlight.';
      slowMovingCount++;
      slowMovingValue += tiedUpCapital;
    } else if (daysOfInventoryRemaining >= 35 && daysOfInventoryRemaining <= 75) {
      // Rule 3: Moderate Velocity
      classification = 'moderate';
      classificationLabel = 'Moderate Velocity';
      urgency = 'medium';
      triggeredRule = `Stock duration between 35 and 75 days (${daysOfInventoryRemaining} days). Balanced consumption rate.`;
      actionRecommendation = 'Monitor weekly demand trends. Reorder strictly upon hitting reorder trigger.';
      moderateCount++;
      moderateValue += tiedUpCapital;
    } else {
      // Rule 4: Fast Moving
      classification = 'fast_moving';
      classificationLabel = 'Fast Moving / Healthy';
      urgency = 'low';
      triggeredRule = `Rapid turnover (${daysOfInventoryRemaining} days of supply). Strong demand velocity.`;
      actionRecommendation = 'Maintain safety buffer. Align batch production to prevent sudden stockout.';
      healthyCount++;
      healthyValue += tiedUpCapital;
    }

    return {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      categoryName: product.categoryId?.name || 'General Furnishings',
      quantityOnHand: stock,
      reorderLevel: reorder,
      costPrice: cost,
      sellingPrice: sell,
      tiedUpCapital,
      annualCarryingCost,
      projectedHoldingLoss90Days,

      unitsSold30Days: demand.qty30,
      unitsSold60Days: demand.qty60,
      unitsSold90Days: demand.qty90,
      totalUnitsSold: demand.totalQty,
      lastSaleDate: demand.lastDate || movements.lastMovementDate || null,
      daysSinceLastSale,
      averageDailyDemand,
      monthlyRunRate,
      daysOfInventoryRemaining,
      inventoryTurnoverRatio,

      classification,
      classificationLabel,
      urgency,
      triggeredRule,
      actionRecommendation
    };
  });

  // Sort items: Critical Dead Stock first, then Slow Moving, then by tied-up capital descending
  const priorityOrder = { dead_stock: 1, slow_moving: 2, low_stock: 3, moderate: 4, fast_moving: 5 };
  analyzedItems.sort((a, b) => {
    if (priorityOrder[a.classification] !== priorityOrder[b.classification]) {
      return priorityOrder[a.classification] - priorityOrder[b.classification];
    }
    return b.tiedUpCapital - a.tiedUpCapital;
  });

  const totalAtRiskCapital = deadStockValue + slowMovingValue;
  const annualCarryingCostWaste = Math.round(totalAtRiskCapital * holdingCostRate);
  const projectedQuarterlyLoss = Math.round(annualCarryingCostWaste * 0.25);
  const averageDaysOfInventory = Math.round(sumDIR / products.length);

  // 5. Generate AI CFO / Rule-Based Executive Action Directives
  const recommendations = [];

  if (deadStockCount > 0) {
    recommendations.push({
      title: 'Liquidate Dormant & Dead Inventory',
      severity: 'high',
      potentialRecovery: deadStockValue,
      message: `${deadStockCount} SKU(s) have accumulated ₹${deadStockValue.toLocaleString('en-IN')} in tied-up capital with zero demand over the last ${horizonDays} days.`,
      suggestedAction: 'Execute a clearance sale with 25-35% price markdowns or bundle with high-velocity conference tables and desks.'
    });
  }

  if (slowMovingCount > 0) {
    recommendations.push({
      title: 'Halt Reorders on Slow-Moving SKUs',
      severity: 'medium',
      potentialRecovery: Math.round(slowMovingValue * 0.4),
      message: `${slowMovingCount} product(s) hold ₹${slowMovingValue.toLocaleString('en-IN')} with run-out horizons exceeding 75 days.`,
      suggestedAction: 'Pause purchase orders and production runs for these items. Feature them on architectural project quotes.'
    });
  }

  if (annualCarryingCostWaste > 50000) {
    recommendations.push({
      title: 'Mitigate Annual Inventory Carrying Waste',
      severity: 'high',
      potentialRecovery: annualCarryingCostWaste,
      message: `Holding at-risk inventory incurs approximately ₹${annualCarryingCostWaste.toLocaleString('en-IN')}/year in storage, insurance, and working capital opportunity loss.`,
      suggestedAction: 'Target freeing at least 50% of at-risk capital within 45 days to reinvest into high-demand timber batches.'
    });
  }

  const result = {
    businessId,
    horizonDays,
    holdingCostRate,
    totalProductsAnalyzed: products.length,
    totalInventoryValue,
    deadStockCount,
    deadStockValue,
    slowMovingCount,
    slowMovingValue,
    moderateCount,
    moderateValue,
    healthyCount,
    healthyValue,
    lowStockCount,
    totalAtRiskCapital,
    annualCarryingCostWaste,
    projectedQuarterlyLoss,
    averageDaysOfInventory,
    items: analyzedItems,
    recommendations,
    generatedAt: new Date()
  };

  // Persist snapshot to MongoDB for historical tracking
  try {
    await SlowMovingAnalysis.findOneAndUpdate(
      { businessId, horizonDays },
      result,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.warn('Could not persist SlowMovingAnalysis to MongoDB:', err.message);
  }

  return result;
};
