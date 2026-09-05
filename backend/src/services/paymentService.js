import mongoose from 'mongoose';
import CustomerPayment from '../models/CustomerPayment.js';
import VendorPayment from '../models/VendorPayment.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import { generateNextNumber } from '../utils/numberGenerator.js';
import { createJournalEntry, postJournalEntry } from './accountingService.js';

const getStandardAccount = async (businessId, type, keywords, session) => {
  const query = { businessId, accountType: type };
  // Find an account containing keywords (e.g., 'Cash', 'Bank', 'Receivable', 'Payable')
  const accounts = await Account.find(query).session(session);
  
  const match = accounts.find(a => 
    keywords.some(k => a.accountName.toLowerCase().includes(k.toLowerCase()) || 
                       a.accountCode.toLowerCase().includes(k.toLowerCase()))
  );
  
  if (!match && accounts.length > 0) return accounts[0]; // fallback to first matching type
  return match;
};

const getJournal = async (businessId, type, session) => {
  let journal = await Journal.findOne({ businessId, journalType: type }).session(session);
  if (!journal) {
    // Fallback to general journal
    journal = await Journal.findOne({ businessId, journalType: 'general' }).session(session);
  }
  return journal;
};

export const processCustomerPayment = async (businessId, userId, data, session) => {
  const { invoiceId, amount, paymentMethod, referenceNumber, notes, paymentDate } = data;

  const invoice = await CustomerInvoice.findOne({ _id: invoiceId, businessId }).session(session);
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
    createdBy: userId
  }], { session });

  // Update invoice
  invoice.paidAmount += amount;
  invoice.balanceDue -= amount;
  invoice.status = invoice.balanceDue === 0 ? 'paid' : 'partially_paid';
  await invoice.save({ session });

  // Update Sales Order payment status
  const order = await SalesOrder.findById(invoice.salesOrderId).session(session);
  if (order) {
    order.paymentStatus = invoice.status === 'paid' ? 'paid' : 'partially_paid';
    await order.save({ session });
  }

  // Auto Journal Entry
  // Debit Cash/Bank (Asset), Credit Accounts Receivable (Asset)
  const isCash = paymentMethod === 'cash';
  const debitAccount = await getStandardAccount(businessId, 'asset', [isCash ? 'cash' : 'bank'], session);
  const creditAccount = await getStandardAccount(businessId, 'asset', ['receivable', 'debtor'], session);
  const journal = await getJournal(businessId, isCash ? 'cash' : 'bank', session);

  if (debitAccount && creditAccount && journal) {
    const jeData = {
      entryDate: paymentDate || Date.now(),
      journalId: journal._id,
      referenceType: 'CustomerPayment',
      referenceId: payment[0]._id,
      description: `Payment received for Invoice ${invoice.invoiceNumber}`,
      createdBy: userId,
      lines: [
        {
          accountId: debitAccount._id,
          accountNameSnapshot: debitAccount.accountName,
          debit: amount,
          credit: 0,
          description: `Receipt from ${invoice.invoiceNumber}`
        },
        {
          accountId: creditAccount._id,
          accountNameSnapshot: creditAccount.accountName,
          debit: 0,
          credit: amount,
          description: `Receipt from ${invoice.invoiceNumber}`
        }
      ]
    };
    const je = await createJournalEntry(businessId, jeData, session);
    await postJournalEntry(je._id, businessId, session);
  }

  return payment[0];
};

export const processVendorPayment = async (businessId, userId, data, session) => {
  const { billId, amount, paymentMethod, referenceNumber, notes, paymentDate } = data;

  const bill = await VendorBill.findOne({ _id: billId, businessId }).session(session);
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
    createdBy: userId
  }], { session });

  // Update bill
  bill.paidAmount += amount;
  bill.balanceDue -= amount;
  bill.status = bill.balanceDue === 0 ? 'paid' : 'partially_paid';
  await bill.save({ session });

  // Update Purchase Order
  const order = await PurchaseOrder.findById(bill.purchaseOrderId).session(session);
  if (order) {
    order.paymentStatus = bill.status === 'paid' ? 'paid' : 'partially_paid';
    await order.save({ session });
  }

  // Auto Journal Entry
  // Debit Accounts Payable (Liability), Credit Cash/Bank (Asset)
  const isCash = paymentMethod === 'cash';
  const debitAccount = await getStandardAccount(businessId, 'liability', ['payable', 'creditor'], session);
  const creditAccount = await getStandardAccount(businessId, 'asset', [isCash ? 'cash' : 'bank'], session);
  const journal = await getJournal(businessId, isCash ? 'cash' : 'bank', session);

  if (debitAccount && creditAccount && journal) {
    const jeData = {
      entryDate: paymentDate || Date.now(),
      journalId: journal._id,
      referenceType: 'VendorPayment',
      referenceId: payment[0]._id,
      description: `Payment to Vendor for Bill ${bill.billNumber}`,
      createdBy: userId,
      lines: [
        {
          accountId: debitAccount._id,
          accountNameSnapshot: debitAccount.accountName,
          debit: amount,
          credit: 0,
          description: `Payment for ${bill.billNumber}`
        },
        {
          accountId: creditAccount._id,
          accountNameSnapshot: creditAccount.accountName,
          debit: 0,
          credit: amount,
          description: `Payment for ${bill.billNumber}`
        }
      ]
    };
    const je = await createJournalEntry(businessId, jeData, session);
    await postJournalEntry(je._id, businessId, session);
  }

  return payment[0];
};
