import mongoose from 'mongoose';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Account from '../models/Account.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import { ROLES } from '../config/roles.js';

export const seedRandomFinancialData = async (targetBusinessId = null) => {
  let businessId = targetBusinessId;
  let owner = null;

  if (!businessId) {
    owner = await User.findOne({ role: ROLES.BUSINESS_OWNER, isArchived: false });
    if (!owner?.businessId) {
      throw new Error('A Business Owner with an associated business is required.');
    }
    businessId = owner.businessId;
  } else {
    owner = await User.findOne({ businessId, role: ROLES.BUSINESS_OWNER });
  }

  const userId = owner ? owner._id : new mongoose.Types.ObjectId();

  // 1. Ensure a primary Cash / Bank account exists with healthy starting balance
  let cashAccount = await Account.findOne({
    businessId,
    accountName: { $regex: /cash|bank/i }
  });

  const startingBalance = Math.floor(Math.random() * (450000 - 280000 + 1)) + 280000; // 2.8L - 4.5L
  if (!cashAccount) {
    cashAccount = await Account.create({
      businessId,
      accountCode: '1010',
      accountName: 'HDFC Current Bank Account',
      accountType: 'asset',
      currentBalance: startingBalance,
      isActive: true
    });
  } else {
    cashAccount.currentBalance = startingBalance;
    await cashAccount.save();
  }

  // 2. Ensure customer and vendor contacts exist
  let customer = await Contact.findOne({ businessId, contactType: { $in: ['customer', 'customer_and_vendor'] } });
  if (!customer) {
    customer = await Contact.create({
      businessId,
      name: 'Urban Living Studios',
      email: 'orders@urbanliving.demo',
      contactType: 'customer',
      isActive: true
    });
  }

  let vendor = await Contact.findOne({ businessId, contactType: { $in: ['vendor', 'customer_and_vendor'] } });
  if (!vendor) {
    vendor = await Contact.create({
      businessId,
      name: 'Sheesham & Teak Wood Works',
      email: 'billing@sheeshamwoods.demo',
      contactType: 'vendor',
      isActive: true
    });
  }

  // 3. Generate randomized future customer invoices (Cash Inflows)
  const now = new Date();
  const createdInvoices = [];
  const invoiceTemplates = [
    { title: 'Bespoke Oak Dining Set', min: 45000, max: 95000 },
    { title: 'Modular Office Workstations', min: 75000, max: 180000 },
    { title: 'Velvet Recliner Lounge Batch', min: 35000, max: 70000 },
    { title: 'Teak Coffee Tables & Credenzas', min: 25000, max: 55000 },
    { title: 'Luxury Villa Bedroom Suites', min: 110000, max: 240000 },
    { title: 'Commercial Cafe Furniture', min: 60000, max: 130000 }
  ];

  for (let i = 1; i <= 14; i++) {
    const tmpl = invoiceTemplates[i % invoiceTemplates.length];
    const amount = Math.floor(Math.random() * (tmpl.max - tmpl.min + 1)) + tmpl.min;
    const dueDayOffset = Math.floor(Math.random() * 75) + 3; // 3 to 78 days in future
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + dueDayOffset);

    const invNum = `INV-TEST-${Date.now().toString().slice(-4)}-${i.toString().padStart(3, '0')}`;
    const inv = await CustomerInvoice.create({
      businessId,
      invoiceNumber: invNum,
      customerId: customer._id,
      invoiceDate: new Date(),
      dueDate,
      subtotal: amount,
      taxAmount: Math.round(amount * 0.18),
      totalAmount: Math.round(amount * 1.18),
      paidAmount: 0,
      balanceDue: Math.round(amount * 1.18),
      status: 'issued',
      createdBy: userId
    });
    createdInvoices.push(inv);
  }

  // 4. Generate randomized future vendor bills (Cash Outflows)
  const createdBills = [];
  const billTemplates = [
    { title: 'Kiln-Dried Teak Timber Batch', min: 35000, max: 80000 },
    { title: 'High-Density Foam & Upholstery', min: 20000, max: 48000 },
    { title: 'Powder-Coated Steel Frames', min: 28000, max: 62000 },
    { title: 'Brass Hardware & Fasteners', min: 12000, max: 30000 },
    { title: 'Matte Polyurethane Finishes', min: 15000, max: 35000 },
    { title: 'CNC Precision Cutting Services', min: 22000, max: 50000 }
  ];

  for (let j = 1; j <= 12; j++) {
    const tmpl = billTemplates[j % billTemplates.length];
    const amount = Math.floor(Math.random() * (tmpl.max - tmpl.min + 1)) + tmpl.min;
    const dueDayOffset = Math.floor(Math.random() * 65) + 2; // 2 to 67 days in future
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + dueDayOffset);

    const billNum = `BILL-TEST-${Date.now().toString().slice(-4)}-${j.toString().padStart(3, '0')}`;
    const bill = await VendorBill.create({
      businessId,
      billNumber: billNum,
      vendorId: vendor._id,
      billDate: new Date(),
      dueDate,
      subtotal: amount,
      taxAmount: Math.round(amount * 0.18),
      totalAmount: Math.round(amount * 1.18),
      paidAmount: 0,
      balanceDue: Math.round(amount * 1.18),
      status: 'issued',
      createdBy: userId
    });
    createdBills.push(bill);
  }

  const totalInflowExpected = createdInvoices.reduce((s, i) => s + i.balanceDue, 0);
  const totalOutflowExpected = createdBills.reduce((s, b) => s + b.balanceDue, 0);

  return {
    success: true,
    startingCash: startingBalance,
    invoicesCreated: createdInvoices.length,
    billsCreated: createdBills.length,
    totalScheduledInflow: totalInflowExpected,
    totalScheduledOutflow: totalOutflowExpected
  };
};

if (process.argv[1].endsWith('seedCashFlowData.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    const result = await seedRandomFinancialData();
    console.log('SUCCESS: Seeded random financial records for cash flow forecasting:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('FAILED to seed data:', err.message);
    process.exit(1);
  });
}
