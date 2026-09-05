import User from '../models/User.js';
import Contact from '../models/Contact.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Contract from '../models/Contract.js';
import { ROLES } from '../config/roles.js';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Demo@123';

const accountants = [
  { name: 'Aarav Shah', email: 'aarav.accountant@craftledger.demo' },
  { name: 'Meera Patel', email: 'meera.accountant@craftledger.demo' },
  { name: 'Kabir Singh', email: 'kabir.accountant@craftledger.demo' },
];

const contacts = [
  { name: 'Amber Interiors', email: 'amber.customer@craftledger.demo', contactType: 'customer' },
  { name: 'Oak & Iron Supplies', email: 'oak.vendor@craftledger.demo', contactType: 'vendor' },
  { name: 'Cedar Projects', email: 'cedar.partner@craftledger.demo', contactType: 'customer_and_vendor' },
];

/**
 * Creates a small, idempotent demo dataset for reviewing each role's UI.
 * Existing accounts are reused and their passwords are never overwritten.
 */
export const seedDemoRoleUsers = async () => {
  const owner = await User.findOne({ role: ROLES.BUSINESS_OWNER, isArchived: false });
  if (!owner?.businessId) {
    throw new Error('A Business Owner with a business is required before demo users can be seeded.');
  }

  for (const accountant of accountants) {
    const existing = await User.findOne({ email: accountant.email });
    if (!existing) {
      await User.create({
        ...accountant,
        passwordHash: DEMO_PASSWORD,
        role: ROLES.ACCOUNTANT,
        businessId: owner.businessId,
        createdBy: owner._id,
        isActive: true,
      });
    }
  }

  const demoContacts = new Map();
  for (const definition of contacts) {
    let contact = await Contact.findOne({ businessId: owner.businessId, email: definition.email });
    if (!contact) {
      contact = await Contact.create({
        ...definition,
        businessId: owner.businessId,
        hasLoginAccess: true,
        isActive: true,
      });
    }

    let user = await User.findOne({ email: definition.email });
    if (!user) {
      user = await User.create({
        name: definition.name,
        email: definition.email,
        passwordHash: DEMO_PASSWORD,
        role: ROLES.CONTACT,
        businessId: owner.businessId,
        contactId: contact._id,
        createdBy: owner._id,
        isActive: true,
      });
    }

    if (!contact.userId || !contact.userId.equals(user._id) || !contact.hasLoginAccess) {
      contact.userId = user._id;
      contact.hasLoginAccess = true;
      await contact.save();
    }
    demoContacts.set(definition.email, contact);
  }

  const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 21);
  const invoiceData = [
    ['INV-DEMO-001', 'amber.customer@craftledger.demo', 12500],
    ['INV-DEMO-002', 'cedar.partner@craftledger.demo', 8400],
  ];
  for (const [invoiceNumber, email, totalAmount] of invoiceData) {
    const contact = demoContacts.get(email);
    await CustomerInvoice.updateOne({ businessId: owner.businessId, invoiceNumber }, { $setOnInsert: { businessId: owner.businessId, invoiceNumber, customerId: contact._id, invoiceDate: new Date(), dueDate, subtotal: totalAmount, taxAmount: 0, totalAmount, paidAmount: 0, balanceDue: totalAmount, status: 'issued', createdBy: owner._id } }, { upsert: true });
  }
  const billData = [
    ['BILL-DEMO-001', 'oak.vendor@craftledger.demo', 6750],
    ['BILL-DEMO-002', 'cedar.partner@craftledger.demo', 4900],
  ];
  for (const [billNumber, email, totalAmount] of billData) {
    const contact = demoContacts.get(email);
    await VendorBill.updateOne({ businessId: owner.businessId, billNumber }, { $setOnInsert: { businessId: owner.businessId, billNumber, vendorId: contact._id, billDate: new Date(), dueDate, subtotal: totalAmount, taxAmount: 0, totalAmount, paidAmount: 0, balanceDue: totalAmount, status: 'issued', createdBy: owner._id } }, { upsert: true });
  }
  for (const contact of demoContacts.values()) {
    await Contract.updateOne({ businessId: owner.businessId, contactId: contact._id }, { $setOnInsert: { businessId: owner.businessId, contactId: contact._id, contractNumber: `CON-DEMO-${contact._id.toString().slice(-5).toUpperCase()}`, contractType: 'demo supply agreement', startDate: new Date(), endDate: dueDate, paymentTerms: 'Net 21 days', creditLimit: 50000, agreedTerms: 'Demonstration contract for the CraftLedger contact portal.', status: 'active' } }, { upsert: true });
  }

  return { password: DEMO_PASSWORD, accountantCount: accountants.length, contactCount: contacts.length };
};
