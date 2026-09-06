import mongoose from 'mongoose';
import SalesOrder from '../models/SalesOrder.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import CustomerPayment from '../models/CustomerPayment.js';
import Product from '../models/Product.js';
import Contact from '../models/Contact.js';
import { generateNextNumber } from '../utils/numberGenerator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createSalesOrder = async (req, res, next) => {
  try {
    const { customerId, orderDate, expectedDeliveryDate, items, discount = 0, notes } = req.body;
    const businessId = req.user.businessId;

    // Validate Customer
    const customer = await Contact.findOne({ _id: customerId, businessId, contactType: { $in: ['customer', 'customer_and_vendor'] }, isActive: true });
    if (!customer) {
      throw new Error('Customer not found or inactive');
    }

    let subtotal = 0;
    let taxAmount = 0;
    const orderItems = [];

    // Process each item to fetch correct pricing from DB (Do NOT trust frontend)
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId, isActive: true });
      if (!product) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      // Calculate line totals
      const itemSubtotal = product.sellingPrice * item.quantity;
      const itemDiscountAmount = itemSubtotal * (item.discount / 100);
      const discountedItemSubtotal = itemSubtotal - itemDiscountAmount;
      const itemTaxAmount = discountedItemSubtotal * (product.taxRate / 100);
      
      const lineTotal = discountedItemSubtotal + itemTaxAmount;

      subtotal += discountedItemSubtotal;
      taxAmount += itemTaxAmount;

      orderItems.push({
        productId: product._id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        costPriceSnapshot: product.costPrice,
        discount: item.discount,
        taxRate: product.taxRate,
        lineTotal
      });
    }

    const orderDiscountAmount = subtotal * (discount / 100);
    const finalSubtotal = subtotal - orderDiscountAmount;
    const totalAmount = finalSubtotal + taxAmount;

    const orderNumber = await generateNextNumber(businessId, 'SalesOrder', 'SO');

    const [salesOrder] = await SalesOrder.create([{
      businessId,
      orderNumber,
      customerId,
      orderDate: orderDate || undefined,
      expectedDeliveryDate,
      items: orderItems,
      subtotal: finalSubtotal,
      discount,
      taxAmount,
      totalAmount,
      notes,
      createdBy: req.user._id
    }]);

    return sendSuccess(res, 201, 'Sales Order created successfully', salesOrder);
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

export const getSalesOrders = async (req, res, next) => {
  try {
    const orders = await SalesOrder.find({ businessId: req.user.businessId })
      .populate('customerId', 'name email phone')
      .sort('-createdAt');
    return sendSuccess(res, 200, 'Sales Orders retrieved', orders);
  } catch (error) {
    next(error);
  }
};

export const getSalesOrderById = async (req, res, next) => {
  try {
    const order = await SalesOrder.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('customerId', 'name email address city state taxNumber')
      .populate('createdBy', 'name');
    
    if (!order) return sendError(res, 404, 'Sales Order not found');
    return sendSuccess(res, 200, 'Sales Order retrieved', order);
  } catch (error) {
    next(error);
  }
};

export const updateSalesOrder = async (req, res, next) => {
  try {
    const { expectedDeliveryDate, notes } = req.body;
    const order = await SalesOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!order) return sendError(res, 404, 'Sales Order not found');
    if (order.status !== 'draft') return sendError(res, 400, 'Only draft orders can be updated directly');

    order.expectedDeliveryDate = expectedDeliveryDate || order.expectedDeliveryDate;
    order.notes = notes || order.notes;
    await order.save();

    return sendSuccess(res, 200, 'Sales Order updated', order);
  } catch (error) {
    next(error);
  }
};

export const deleteSalesOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!order) return sendError(res, 404, 'Sales Order not found');
    if (order.status !== 'draft') return sendError(res, 400, 'Only draft orders can be deleted/cancelled');

    order.status = 'cancelled';
    await order.save();

    return sendSuccess(res, 200, 'Sales Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const confirmSalesOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });
    
    if (!order) return sendError(res, 404, 'Sales Order not found');
    if (order.status !== 'draft') return sendError(res, 400, 'Order is already processed or cancelled');

    order.status = 'confirmed';
    await order.save();

    return sendSuccess(res, 200, 'Sales Order confirmed', order);
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const businessId = req.user.businessId;
    const order = await SalesOrder.findOne({ _id: req.params.id, businessId }).session(session);
    
    if (!order) throw new Error('Sales Order not found');
    if (['draft', 'cancelled'].includes(order.status)) throw new Error(`Cannot generate invoice for ${order.status} order`);
    
    // Check if invoice already exists
    const existingInvoice = await CustomerInvoice.findOne({ salesOrderId: order._id }).session(session);
    if (existingInvoice) throw new Error('Invoice already exists for this order');

    const invoiceNumber = await generateNextNumber(businessId, 'CustomerInvoice', 'INV');
    
    // Default due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await CustomerInvoice.create([{
      businessId,
      invoiceNumber,
      salesOrderId: order._id,
      customerId: order.customerId,
      dueDate,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discount: order.discount,
      totalAmount: order.totalAmount,
      balanceDue: order.totalAmount,
      status: 'issued',
      createdBy: req.user._id
    }], { session });

    order.status = 'processing';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Invoice generated successfully', invoice[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const query = { businessId: req.user.businessId };
    if (req.user.role === 'contact') query.customerId = req.user.contactId;
    const invoices = await CustomerInvoice.find(query)
      .populate('customerId', 'name email phone')
      .populate('salesOrderId', 'orderNumber')
      .sort('-createdAt');
    return sendSuccess(res, 200, 'Invoices retrieved', invoices);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await CustomerInvoice.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('customerId', 'name email address city state taxNumber')
      .populate('salesOrderId', 'orderNumber items notes')
      .populate('createdBy', 'name');
    
    if (!invoice) return sendError(res, 404, 'Invoice not found');
    return sendSuccess(res, 200, 'Invoice retrieved', invoice);
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod, referenceNumber, notes, paymentDate } = req.body;
    const businessId = req.user.businessId;

    const invoice = await CustomerInvoice.findOne({ _id: req.params.id, businessId }).session(session);
    
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'cancelled') throw new Error('Cannot pay a cancelled invoice');
    if (amount > invoice.balanceDue) throw new Error(`Payment amount (${amount}) exceeds balance due (${invoice.balanceDue})`);

    const paymentNumber = await generateNextNumber(businessId, 'CustomerPayment', 'PAY');

    const payment = await CustomerPayment.create([{
      businessId,
      paymentNumber,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      paymentDate: paymentDate || Date.now(),
      createdBy: req.user._id
    }], { session });

    // Update invoice
    invoice.paidAmount += amount;
    invoice.balanceDue -= amount;
    
    if (invoice.balanceDue === 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partially_paid';
    }
    
    await invoice.save({ session });

    // Update order payment status
    const order = await SalesOrder.findById(invoice.salesOrderId).session(session);
    if (order) {
      order.paymentStatus = invoice.status === 'paid' ? 'paid' : 'partially_paid';
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, 201, 'Payment recorded successfully', payment[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendError(res, 400, error.message);
  }
};

export const getInvoicePayments = async (req, res, next) => {
  try {
    const payments = await CustomerPayment.find({ 
      invoiceId: req.params.id, 
      businessId: req.user.businessId 
    }).populate('createdBy', 'name').sort('-createdAt');
    
    return sendSuccess(res, 200, 'Payments retrieved', payments);
  } catch (error) {
    next(error);
  }
};
