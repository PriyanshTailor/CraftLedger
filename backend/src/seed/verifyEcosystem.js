import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Contract from '../models/Contract.js';
import Business from '../models/Business.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import CustomerPayment from '../models/CustomerPayment.js';
import VendorPayment from '../models/VendorPayment.js';
import AuditLog from '../models/AuditLog.js';

(async () => {
  await connectDB();

  const businesses = await Business.find({});
  console.log('\n================ BUSINESS ECOSYSTEM SUMMARY ================');
  for (const b of businesses) {
    if (b.businessName === 'Furniture') continue;
    const soCount = await SalesOrder.countDocuments({ businessId: b._id });
    const poCount = await PurchaseOrder.countDocuments({ businessId: b._id });
    const invCount = await CustomerInvoice.countDocuments({ businessId: b._id });
    const billCount = await VendorBill.countDocuments({ businessId: b._id });
    const custPay = await CustomerPayment.countDocuments({ businessId: b._id });
    const vendPay = await VendorPayment.countDocuments({ businessId: b._id });
    const custCount = await Contact.countDocuments({ businessId: b._id, contactType: { $in: ['customer', 'customer_and_vendor'] } });
    const vendCount = await Contact.countDocuments({ businessId: b._id, contactType: { $in: ['vendor', 'customer_and_vendor'] } });
    const contCount = await Contract.countDocuments({ businessId: b._id });
    console.log(JSON.stringify({
      Company: b.businessName,
      Customers: custCount,
      Vendors: vendCount,
      Contracts: contCount,
      SalesOrders: soCount,
      PurchaseOrders: poCount,
      Invoices: invCount,
      VendorBills: billCount,
      TotalPayments: custPay + vendPay
    }, null, 2));
  }

  const auditCount = await AuditLog.countDocuments({});
  console.log('\nTotal Platform Audit Logs in DB:', auditCount);

  const users = await User.find({}).populate('businessId');
  console.log('\n================ ALL ROLE-BASED USERS (' + users.length + ' USERS) ================');
  for (const u of users) {
    const contact = u.contactId ? await Contact.findById(u.contactId) : null;
    const contract = u.contactId ? await Contract.findOne({ contactId: u.contactId }) : null;
    console.log(
      u.email.padEnd(36),
      u.role.padEnd(16),
      (u.businessId?.businessName || 'Platform (Admin)').padEnd(42),
      'HasContract:', !!contract
    );
  }

  process.exit(0);
})();
