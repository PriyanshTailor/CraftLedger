import crypto from 'crypto';
import Contact from '../models/Contact.js';
import Business from '../models/Business.js';
import Contract from '../models/Contract.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import CustomerPayment from '../models/CustomerPayment.js';
import VendorPayment from '../models/VendorPayment.js';
import AuditLog from '../models/AuditLog.js';
import { generateNextNumber } from '../utils/numberGenerator.js';
import { sendSuccess, sendError } from '../utils/response.js';

const CUSTOMER_TYPES = ['customer', 'customer_and_vendor'];
const VENDOR_TYPES = ['vendor', 'customer_and_vendor'];
const PAYMENT_METHODS = ['simulated_upi', 'simulated_card', 'simulated_net_banking', 'simulated_bank_transfer', 'cash'];

const context = async (req) => {
  const contact = await Contact.findOne({ _id: req.user.contactId, businessId: req.user.businessId, isActive: true });
  if (!contact) throw new Error('Contact profile not found');
  return contact;
};
const notFound = (res) => sendError(res, 404, 'Record not found');
const safeStatus = (record) => record.balanceDue <= 0 ? 'paid' : record.paidAmount > 0 ? 'partially_paid' : (record.dueDate < new Date() ? 'overdue' : 'issued');
const normalizePayment = (payment, recordType) => ({ ...payment.toObject(), recordType, receiptAvailable: true });

export const getDashboard = async (req, res, next) => {
  try {
    const contact = await context(req);
    const invoiceQuery = { businessId: req.user.businessId, customerId: contact._id };
    const billQuery = { businessId: req.user.businessId, vendorId: contact._id };
    const [invoices, bills, customerPayments, vendorPayments, contract] = await Promise.all([
      CUSTOMER_TYPES.includes(contact.contactType) ? CustomerInvoice.find(invoiceQuery).sort('-invoiceDate').limit(5).lean() : [],
      VENDOR_TYPES.includes(contact.contactType) ? VendorBill.find(billQuery).sort('-billDate').limit(5).lean() : [],
      CustomerPayment.find({ businessId: req.user.businessId, customerId: contact._id }).sort('-paymentDate').limit(5).lean(),
      VendorPayment.find({ businessId: req.user.businessId, vendorId: contact._id }).sort('-paymentDate').limit(5).lean(),
      Contract.findOne({ businessId: req.user.businessId, contactId: contact._id, status: 'active' }).lean(),
    ]);
    const outstanding = [...invoices, ...bills].reduce((sum, record) => sum + record.balanceDue, 0);
    const paid = [...customerPayments, ...vendorPayments].reduce((sum, payment) => sum + payment.amount, 0);
    return sendSuccess(res, 200, 'Contact dashboard retrieved', { contactType: contact.contactType, invoices, bills, payments: [...customerPayments, ...vendorPayments].sort((a, b) => b.paymentDate - a.paymentDate), contract, totals: { invoices: invoices.length, bills: bills.length, unpaid: [...invoices, ...bills].filter(r => r.balanceDue > 0).length, outstanding, paid } });
  } catch (error) { next(error); }
};

export const getProfile = async (req, res, next) => {
  try {
    const contact = await context(req);
    const business = await Business.findById(req.user.businessId).select('businessName email phone address city state country');
    return sendSuccess(res, 200, 'Contact profile retrieved', { contact, business, accountStatus: req.user.isActive ? 'active' : 'inactive' });
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const contact = await context(req);
    const permitted = ['name', 'phone', 'address', 'city', 'state'];
    for (const key of permitted) if (typeof req.body[key] === 'string') contact[key] = req.body[key].trim();
    await contact.save();
    if (typeof req.body.name === 'string') { req.user.name = contact.name; await req.user.save(); }
    return sendSuccess(res, 200, 'Profile updated', { contact });
  } catch (error) { next(error); }
};

export const getInvoices = async (req, res, next) => {
  try {
    const contact = await context(req);
    if (!CUSTOMER_TYPES.includes(contact.contactType)) return notFound(res);
    const invoices = await CustomerInvoice.find({ businessId: req.user.businessId, customerId: contact._id }).sort('-invoiceDate');
    return sendSuccess(res, 200, 'Invoices retrieved', invoices);
  } catch (error) { next(error); }
};
export const getInvoice = async (req, res, next) => {
  try {
    const contact = await context(req);
    if (!CUSTOMER_TYPES.includes(contact.contactType)) return notFound(res);
    const invoice = await CustomerInvoice.findOne({ _id: req.params.id, businessId: req.user.businessId, customerId: contact._id }).populate('salesOrderId', 'orderNumber items');
    if (!invoice) return notFound(res);
    const payments = await CustomerPayment.find({ businessId: req.user.businessId, customerId: contact._id, invoiceId: invoice._id }).sort('-paymentDate');
    return sendSuccess(res, 200, 'Invoice retrieved', { invoice, payments });
  } catch (error) { next(error); }
};
export const getBills = async (req, res, next) => {
  try {
    const contact = await context(req);
    if (!VENDOR_TYPES.includes(contact.contactType)) return notFound(res);
    const bills = await VendorBill.find({ businessId: req.user.businessId, vendorId: contact._id }).sort('-billDate');
    return sendSuccess(res, 200, 'Bills retrieved', bills);
  } catch (error) { next(error); }
};
export const getBill = async (req, res, next) => {
  try {
    const contact = await context(req);
    if (!VENDOR_TYPES.includes(contact.contactType)) return notFound(res);
    const bill = await VendorBill.findOne({ _id: req.params.id, businessId: req.user.businessId, vendorId: contact._id }).populate('purchaseOrderId', 'purchaseOrderNumber items');
    if (!bill) return notFound(res);
    const payments = await VendorPayment.find({ businessId: req.user.businessId, vendorId: contact._id, billId: bill._id }).sort('-paymentDate');
    return sendSuccess(res, 200, 'Bill retrieved', { bill, payments });
  } catch (error) { next(error); }
};

export const getPayments = async (req, res, next) => {
  try {
    const contact = await context(req);
    const [customer, vendor] = await Promise.all([
      CustomerPayment.find({ businessId: req.user.businessId, customerId: contact._id }).populate('invoiceId', 'invoiceNumber').sort('-paymentDate'),
      VendorPayment.find({ businessId: req.user.businessId, vendorId: contact._id }).populate('billId', 'billNumber').sort('-paymentDate'),
    ]);
    const payments = [...customer.map(p => normalizePayment(p, 'invoice')), ...vendor.map(p => normalizePayment(p, 'bill'))].sort((a, b) => b.paymentDate - a.paymentDate);
    return sendSuccess(res, 200, 'Payments retrieved', payments);
  } catch (error) { next(error); }
};
export const getPayment = async (req, res, next) => {
  try {
    const contact = await context(req);
    const [customer, vendor] = await Promise.all([
      CustomerPayment.findOne({ _id: req.params.id, businessId: req.user.businessId, customerId: contact._id }).populate('invoiceId', 'invoiceNumber'),
      VendorPayment.findOne({ _id: req.params.id, businessId: req.user.businessId, vendorId: contact._id }).populate('billId', 'billNumber'),
    ]);
    const payment = customer ? normalizePayment(customer, 'invoice') : vendor ? normalizePayment(vendor, 'bill') : null;
    if (!payment) return notFound(res);
    return sendSuccess(res, 200, 'Payment retrieved', payment);
  } catch (error) { next(error); }
};

export const simulatePayment = async (req, res, next) => {
  try {
    const { recordType, recordId, amount, paymentMethod } = req.body;
    const contact = await context(req);
    const numericAmount = Number(amount);
    if (!['invoice', 'bill'].includes(recordType) || !PAYMENT_METHODS.includes(paymentMethod) || !Number.isFinite(numericAmount) || numericAmount <= 0) return sendError(res, 400, 'Provide a valid record, payment method, and amount');
    const isInvoice = recordType === 'invoice';
    if ((isInvoice && !CUSTOMER_TYPES.includes(contact.contactType)) || (!isInvoice && !VENDOR_TYPES.includes(contact.contactType))) return notFound(res);
    const Model = isInvoice ? CustomerInvoice : VendorBill;
    const contactKey = isInvoice ? 'customerId' : 'vendorId';
    const record = await Model.findOne({ _id: recordId, businessId: req.user.businessId, [contactKey]: contact._id });
    if (!record) return notFound(res);
    if (record.status === 'cancelled' || record.balanceDue <= 0 || numericAmount > record.balanceDue) return sendError(res, 400, 'This record cannot be paid for the requested amount');
    const paymentNumber = await generateNextNumber(req.user.businessId, isInvoice ? 'CustomerPayment' : 'VendorPayment', isInvoice ? 'PAY' : 'VPAY');
    const transactionReference = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const Payment = isInvoice ? CustomerPayment : VendorPayment;
    const payment = await Payment.create({ businessId: req.user.businessId, paymentNumber, [isInvoice ? 'invoiceId' : 'billId']: record._id, [contactKey]: contact._id, amount: numericAmount, paymentMethod, paymentMode: 'simulation', status: 'successful', transactionReference, referenceNumber: transactionReference, paymentDate: new Date(), createdBy: req.user._id, notes: 'Simulated demo payment; no money transferred.' });
    record.paidAmount += numericAmount;
    record.balanceDue = Math.max(0, record.balanceDue - numericAmount);
    record.status = safeStatus(record);
    await record.save();
    await AuditLog.create({ businessId: req.user.businessId, userId: req.user._id, role: req.user.role, action: 'simulated_payment_completed', module: 'contact_portal', recordId: payment._id, description: `Simulated payment ${paymentNumber} completed for ${recordType} ${record._id}` });
    return sendSuccess(res, 201, 'Demo payment completed successfully', { payment: normalizePayment(payment, recordType), record: { id: record._id, number: isInvoice ? record.invoiceNumber : record.billNumber, balanceDue: record.balanceDue, status: record.status }, receipt: { reference: paymentNumber, transactionReference, simulated: true } });
  } catch (error) { next(error); }
};

export const getContract = async (req, res, next) => {
  try { const contact = await context(req); const contract = await Contract.findOne({ businessId: req.user.businessId, contactId: contact._id }).sort('-createdAt'); return sendSuccess(res, 200, 'Contract retrieved', { contract }); } catch (error) { next(error); }
};
export const getReceipt = async (req, res, next) => {
  try { const contact = await context(req); const [customer, vendor] = await Promise.all([CustomerPayment.findOne({ _id: req.params.id, businessId: req.user.businessId, customerId: contact._id }), VendorPayment.findOne({ _id: req.params.id, businessId: req.user.businessId, vendorId: contact._id })]); const payment = customer || vendor; if (!payment) return notFound(res); return sendSuccess(res, 200, 'Receipt retrieved', { receiptNumber: payment.paymentNumber, transactionReference: payment.transactionReference || payment.referenceNumber, paymentDate: payment.paymentDate, amount: payment.amount, paymentMethod: payment.paymentMethod, status: payment.status || 'successful', simulated: payment.paymentMode === 'simulation' }); } catch (error) { next(error); }
};
