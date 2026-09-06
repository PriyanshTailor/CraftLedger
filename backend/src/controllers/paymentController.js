import mongoose from 'mongoose';
import CustomerPayment from '../models/CustomerPayment.js';
import VendorPayment from '../models/VendorPayment.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { processCustomerPayment, processVendorPayment } from '../services/paymentService.js';

export const getCustomerPayments = async (req, res, next) => {
  try {
    const payments = await CustomerPayment.find({ businessId: req.user.businessId })
      .populate('customerId', 'name email')
      .populate('invoiceId', 'invoiceNumber')
      .sort('-paymentDate -createdAt');
    return sendSuccess(res, 200, 'Customer payments retrieved', payments);
  } catch (error) {
    next(error);
  }
};

export const getVendorPayments = async (req, res, next) => {
  try {
    const payments = await VendorPayment.find({ businessId: req.user.businessId })
      .populate('vendorId', 'name email')
      .populate('billId', 'billNumber')
      .sort('-paymentDate -createdAt');
    return sendSuccess(res, 200, 'Vendor payments retrieved', payments);
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const [custPayments, vendPayments] = await Promise.all([
      CustomerPayment.find({ businessId: req.user.businessId }).lean(),
      VendorPayment.find({ businessId: req.user.businessId }).lean()
    ]);

    const all = [
      ...custPayments.map(p => ({ ...p, type: 'CustomerPayment' })),
      ...vendPayments.map(p => ({ ...p, type: 'VendorPayment' }))
    ].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    return sendSuccess(res, 200, 'All payments retrieved', all);
  } catch (error) {
    next(error);
  }
};

export const createCustomerPayment = async (req, res, next) => {

  try {
    const payment = await processCustomerPayment(req.user.businessId, req.user._id, req.body, session);


    return sendSuccess(res, 201, 'Customer payment recorded successfully', payment);
  } catch (error) {
            return sendError(res, 400, error.message);
  }
};

export const createVendorPayment = async (req, res, next) => {

  try {
    const payment = await processVendorPayment(req.user.businessId, req.user._id, req.body, session);


    return sendSuccess(res, 201, 'Vendor payment recorded successfully', payment);
  } catch (error) {
            return sendError(res, 400, error.message);
  }
};

export const getOutstandingReceivables = async (req, res, next) => {
  try {
    const invoices = await CustomerInvoice.find({
      businessId: req.user.businessId,
      status: { $in: ['issued', 'partially_paid', 'overdue'] }
    }).populate('customerId', 'name');

    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    return sendSuccess(res, 200, 'Outstanding receivables retrieved', {
      totalOutstanding,
      invoices
    });
  } catch (error) {
    next(error);
  }
};

export const getOutstandingPayables = async (req, res, next) => {
  try {
    const bills = await VendorBill.find({
      businessId: req.user.businessId,
      status: { $in: ['issued', 'partially_paid', 'overdue'] }
    }).populate('vendorId', 'name');

    const totalOutstanding = bills.reduce((sum, bill) => sum + bill.balanceDue, 0);

    return sendSuccess(res, 200, 'Outstanding payables retrieved', {
      totalOutstanding,
      bills
    });
  } catch (error) {
    next(error);
  }
};

export const getCashSummary = async (req, res, next) => {
  try {
    const [custCash, vendCash] = await Promise.all([
      CustomerPayment.aggregate([
        { $match: { businessId: req.user.businessId, paymentMethod: 'cash' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      VendorPayment.aggregate([
        { $match: { businessId: req.user.businessId, paymentMethod: 'cash' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const cashIn = custCash.length > 0 ? custCash[0].total : 0;
    const cashOut = vendCash.length > 0 ? vendCash[0].total : 0;

    return sendSuccess(res, 200, 'Cash summary retrieved', {
      cashIn,
      cashOut,
      netCash: cashIn - cashOut
    });
  } catch (error) {
    next(error);
  }
};

export const getBankSummary = async (req, res, next) => {
  try {
    const bankMethods = ['bank_transfer', 'UPI', 'cheque', 'card'];

    const [custBank, vendBank] = await Promise.all([
      CustomerPayment.aggregate([
        { $match: { businessId: req.user.businessId, paymentMethod: { $in: bankMethods } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      VendorPayment.aggregate([
        { $match: { businessId: req.user.businessId, paymentMethod: { $in: bankMethods } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const bankIn = custBank.length > 0 ? custBank[0].total : 0;
    const bankOut = vendBank.length > 0 ? vendBank[0].total : 0;

    return sendSuccess(res, 200, 'Bank summary retrieved', {
      bankIn,
      bankOut,
      netBank: bankIn - bankOut
    });
  } catch (error) {
    next(error);
  }
};
