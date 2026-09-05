import mongoose from 'mongoose';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import InventoryAdjustment from '../models/InventoryAdjustment.js';
import SalesOrder from '../models/SalesOrder.js';
import { generateNextNumber } from '../utils/numberGenerator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getInventoryOverview = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;

    const products = await Product.find({ businessId, isActive: true });
    
    let totalValue = 0;
    let totalItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      totalValue += p.inventoryValue || (p.quantityOnHand * p.costPrice);
      totalItems += 1;
      if (p.quantityOnHand <= 0) {
        outOfStockCount++;
      } else if (p.quantityOnHand <= p.reorderLevel) {
        lowStockCount++;
      }
    });

    return sendSuccess(res, 200, 'Inventory overview retrieved', {
      totalValue,
      totalItems,
      lowStockCount,
      outOfStockCount
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ businessId: req.user.businessId, isActive: true })
      .populate('categoryId', 'name')
      .sort('name');
    
    return sendSuccess(res, 200, 'Inventory products retrieved', products);
  } catch (error) {
    next(error);
  }
};

export const getInventoryProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('categoryId', 'name');
    
    if (!product) return sendError(res, 404, 'Product not found');
    
    return sendSuccess(res, 200, 'Product retrieved', product);
  } catch (error) {
    next(error);
  }
};

export const getProductMovements = async (req, res, next) => {
  try {
    const movements = await StockMovement.find({ 
      productId: req.params.id, 
      businessId: req.user.businessId 
    })
    .populate('createdBy', 'name')
    .sort('-createdAt');
    
    return sendSuccess(res, 200, 'Stock movements retrieved', movements);
  } catch (error) {
    next(error);
  }
};

export const createAdjustment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, notes, date, status = 'draft' } = req.body;
    const businessId = req.user.businessId;

    let totalValueChange = 0;
    const adjustmentNumber = await generateNextNumber(businessId, 'InventoryAdjustment', 'ADJ');

    // Create the adjustment document first
    const adjustment = await InventoryAdjustment.create([{
      businessId,
      adjustmentNumber,
      date: date || Date.now(),
      items,
      totalValueChange: 0, // will update
      status,
      notes,
      createdBy: req.user._id,
      approvedBy: status === 'approved' ? req.user._id : null
    }], { session });

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId }).session(session);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const previousQuantity = product.quantityOnHand;
      let newQuantity = previousQuantity;
      let valueChange = item.quantity * item.unitCost;

      if (item.adjustmentType === 'increase') {
        newQuantity += item.quantity;
        totalValueChange += valueChange;
        
        // Basic weighted average cost calculation
        const totalExistingValue = previousQuantity * product.costPrice;
        const totalNewValue = item.quantity * item.unitCost;
        if (newQuantity > 0) {
          product.costPrice = (totalExistingValue + totalNewValue) / newQuantity;
        }

      } else {
        newQuantity -= item.quantity;
        totalValueChange -= valueChange;
        
        if (newQuantity < 0) {
          throw new Error(`Cannot decrease stock below 0 for product ${product.name}`);
        }
      }

      // If adjustment is approved, apply the stock changes and create stock movements
      if (status === 'approved') {
        product.quantityOnHand = newQuantity;
        product.inventoryValue = newQuantity * product.costPrice;
        await product.save({ session });

        await StockMovement.create([{
          businessId,
          productId: product._id,
          movementType: item.adjustmentType === 'increase' ? 'adjustment_in' : 'adjustment_out',
          quantity: item.quantity,
          previousQuantity,
          newQuantity,
          unitCost: item.unitCost,
          totalValue: valueChange,
          referenceType: 'InventoryAdjustment',
          referenceId: adjustment[0]._id,
          notes: item.reason,
          createdBy: req.user._id
        }], { session });
      }
    }

    adjustment[0].totalValueChange = totalValueChange;
    await adjustment[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, `Inventory adjustment ${status}`, adjustment[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getAdjustments = async (req, res, next) => {
  try {
    const adjustments = await InventoryAdjustment.find({ businessId: req.user.businessId })
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    return sendSuccess(res, 200, 'Inventory adjustments retrieved', adjustments);
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    // MongoDB trick: compare quantityOnHand with reorderLevel
    // Since reorderLevel might be 0, we use $expr
    const products = await Product.find({ 
      businessId: req.user.businessId,
      isActive: true,
      $expr: { $lte: ["$quantityOnHand", "$reorderLevel"] }
    }).populate('categoryId', 'name').sort('quantityOnHand');
    
    return sendSuccess(res, 200, 'Low stock products retrieved', products);
  } catch (error) {
    next(error);
  }
};

export const getValuation = async (req, res, next) => {
  try {
    const products = await Product.find({ businessId: req.user.businessId, isActive: true, quantityOnHand: { $gt: 0 } })
      .populate('categoryId', 'name')
      .sort('-inventoryValue');
    
    const totalValuation = products.reduce((sum, p) => sum + (p.inventoryValue || (p.quantityOnHand * p.costPrice)), 0);

    return sendSuccess(res, 200, 'Inventory valuation retrieved', { totalValuation, products });
  } catch (error) {
    next(error);
  }
};

export const getProfitability = async (req, res, next) => {
  try {
    const products = await Product.find({ businessId: req.user.businessId, isActive: true })
      .populate('categoryId', 'name');
    
    // Aggregate historical sales logic could be complex. For a quick profitability 
    // metric based on current prices, we calculate theoretical margins.
    const profitability = products.map(p => {
      const margin = p.sellingPrice - p.costPrice;
      const marginPercentage = p.sellingPrice > 0 ? (margin / p.sellingPrice) * 100 : 0;
      
      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.categoryId ? p.categoryId.name : 'Uncategorized',
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        margin,
        marginPercentage: parseFloat(marginPercentage.toFixed(2))
      };
    });

    profitability.sort((a, b) => b.marginPercentage - a.marginPercentage);

    return sendSuccess(res, 200, 'Profitability metrics retrieved', profitability);
  } catch (error) {
    next(error);
  }
};
