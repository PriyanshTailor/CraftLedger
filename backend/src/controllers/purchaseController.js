import mongoose from 'mongoose';
import PurchaseOrder from '../models/PurchaseOrder.js';
import VendorBill from '../models/VendorBill.js';
import VendorPayment from '../models/VendorPayment.js';
import Product from '../models/Product.js';
import Contact from '../models/Contact.js';
import { generateNextNumber } from '../utils/numberGenerator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createPurchaseOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { vendorId, expectedDeliveryDate, items, notes } = req.body;
    const businessId = req.user.businessId;

    // Validate Vendor
    const vendor = await Contact.findOne({ _id: vendorId, businessId, contactType: 'vendor', isActive: true }).session(session);
    if (!vendor) {
      throw new Error('Vendor not found or inactive');
    }

    let subtotal = 0;
    let taxAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId, isActive: true }).session(session);
      if (!product) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      // Calculate line totals based on current product cost
      const itemSubtotal = product.costPrice * item.quantity;
      const itemTaxAmount = itemSubtotal * (product.taxRate / 100);
      
      const lineTotal = itemSubtotal + itemTaxAmount;

      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount;

      orderItems.push({
        productId: product._id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitCost: product.costPrice,
        taxRate: product.taxRate,
        lineTotal
      });
    }

    const totalAmount = subtotal + taxAmount;
    const purchaseOrderNumber = await generateNextNumber(businessId, 'PurchaseOrder', 'PO');

    const purchaseOrder = await PurchaseOrder.create([{
      businessId,
      purchaseOrderNumber,
      vendorId,
      expectedDeliveryDate,
      items: orderItems,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Purchase Order created successfully', purchaseOrder[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    if (error.message.includes('not found')) {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find({ businessId: req.user.businessId })
      .populate('vendorId', 'name email phone')
      .sort('-createdAt');
    return sendSuccess(res, 200, 'Purchase Orders retrieved', orders);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('vendorId', 'name email address city state taxNumber')
      .populate('createdBy', 'name');
    
    if (!order) return sendError(res, 404, 'Purchase Order not found');
    return sendSuccess(res, 200, 'Purchase Order retrieved', order);
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const { expectedDeliveryDate, notes } = req.body;
    const order = await PurchaseOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!order) return sendError(res, 404, 'Purchase Order not found');
    if (order.status !== 'draft') return sendError(res, 400, 'Only draft orders can be updated directly');

    order.expectedDeliveryDate = expectedDeliveryDate || order.expectedDeliveryDate;
    order.notes = notes || order.notes;
    await order.save();

    return sendSuccess(res, 200, 'Purchase Order updated', order);
  } catch (error) {
    next(error);
  }
};

export const deletePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!order) return sendError(res, 404, 'Purchase Order not found');
    if (order.status !== 'draft') return sendError(res, 400, 'Only draft orders can be deleted/cancelled');

    order.status = 'cancelled';
    await order.save();

    return sendSuccess(res, 200, 'Purchase Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const confirmPurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!order) return sendError(res, 404, 'Purchase Order not found');
    if (order.status !== 'draft') return sendError(res, 400, 'Order is already processed or cancelled');

    order.status = 'confirmed';
    await order.save();

    return sendSuccess(res, 200, 'Purchase Order confirmed', order);
  } catch (error) {
    next(error);
  }
};

export const receiveProducts = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;
    const order = await PurchaseOrder.findOne({ _id: req.params.id, businessId: req.user.businessId }).session(session);
    
    if (!order) throw new Error('Purchase Order not found');
    if (['draft', 'cancelled', 'received'].includes(order.status)) {
      throw new Error(`Cannot receive products for ${order.status} order`);
    }

    let allFullyReceived = true;

    for (const reqItem of items) {
      const orderItem = order.items.find(i => i.productId.toString() === reqItem.productId);
      
      if (!orderItem) throw new Error(`Product ${reqItem.productId} not in order`);
      
      const remainingToReceive = orderItem.quantity - orderItem.receivedQuantity;
      if (reqItem.quantityToReceive > remainingToReceive) {
        throw new Error(`Cannot receive ${reqItem.quantityToReceive} for product ${orderItem.productNameSnapshot}. Only ${remainingToReceive} remaining.`);
      }

      orderItem.receivedQuantity += reqItem.quantityToReceive;

      if (orderItem.receivedQuantity < orderItem.quantity) {
        allFullyReceived = false;
      }

      // Update actual product inventory
      const product = await Product.findById(reqItem.productId).session(session);
      product.quantityOnHand += reqItem.quantityToReceive;
      // Also update total inventory value (qty * cost)
      product.inventoryValue = product.quantityOnHand * product.costPrice;
      await product.save({ session });
    }

    order.status = allFullyReceived ? 'received' : 'partially_received';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 200, 'Products received and inventory updated successfully', order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const generateBill = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const businessId = req.user.businessId;
    const order = await PurchaseOrder.findOne({ _id: req.params.id, businessId }).session(session);
    
    if (!order) throw new Error('Purchase Order not found');
    if (['draft', 'cancelled'].includes(order.status)) throw new Error(`Cannot generate bill for ${order.status} order`);
    
    const existingBill = await VendorBill.findOne({ purchaseOrderId: order._id }).session(session);
    if (existingBill) throw new Error('Bill already exists for this purchase order');

    const billNumber = await generateNextNumber(businessId, 'VendorBill', 'BILL');
    
    // Default due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const bill = await VendorBill.create([{
      businessId,
      billNumber,
      purchaseOrderId: order._id,
      vendorId: order.vendorId,
      dueDate,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      balanceDue: order.totalAmount,
      status: 'issued',
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Bill generated successfully', bill[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getBills = async (req, res, next) => {
  try {
    const query = { businessId: req.user.businessId };
    if (req.user.role === 'contact') query.vendorId = req.user.contactId;
    const bills = await VendorBill.find(query)
      .populate('vendorId', 'name email phone')
      .populate('purchaseOrderId', 'purchaseOrderNumber')
      .sort('-createdAt');
    return sendSuccess(res, 200, 'Bills retrieved', bills);
  } catch (error) {
    next(error);
  }
};

export const getBillById = async (req, res, next) => {
  try {
    const bill = await VendorBill.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('vendorId', 'name email address city state taxNumber')
      .populate('purchaseOrderId', 'purchaseOrderNumber items notes')
      .populate('createdBy', 'name');
    
    if (!bill) return sendError(res, 404, 'Bill not found');
    return sendSuccess(res, 200, 'Bill retrieved', bill);
  } catch (error) {
    next(error);
  }
};

export const recordVendorPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod, referenceNumber, notes, paymentDate } = req.body;
    const businessId = req.user.businessId;

    const bill = await VendorBill.findOne({ _id: req.params.id, businessId }).session(session);
    
    if (!bill) throw new Error('Bill not found');
    if (bill.status === 'cancelled') throw new Error('Cannot pay a cancelled bill');
    if (amount > bill.balanceDue) throw new Error(`Payment amount (${amount}) exceeds balance due (${bill.balanceDue})`);

    const paymentNumber = await generateNextNumber(businessId, 'VendorPayment', 'VPAY');

    const payment = await VendorPayment.create([{
      businessId,
      paymentNumber,
      billId: bill._id,
      vendorId: bill.vendorId,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      paymentDate: paymentDate || Date.now(),
      createdBy: req.user._id
    }], { session });

    // Update bill
    bill.paidAmount += amount;
    bill.balanceDue -= amount;
    
    if (bill.balanceDue === 0) {
      bill.status = 'paid';
    } else {
      bill.status = 'partially_paid';
    }
    
    await bill.save({ session });

    // Update order payment status
    const order = await PurchaseOrder.findById(bill.purchaseOrderId).session(session);
    if (order) {
      order.paymentStatus = bill.status === 'paid' ? 'paid' : 'partially_paid';
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Vendor payment recorded successfully', payment[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getBillPayments = async (req, res, next) => {
  try {
    const payments = await VendorPayment.find({ 
      billId: req.params.id, 
      businessId: req.user.businessId 
    }).populate('createdBy', 'name').sort('-createdAt');
    
    return sendSuccess(res, 200, 'Payments retrieved', payments);
  } catch (error) {
    next(error);
  }
};
