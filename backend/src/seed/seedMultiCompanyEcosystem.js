import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Contact from '../models/Contact.js';
import Contract from '../models/Contract.js';
import ProductCategory from '../models/ProductCategory.js';
import Product from '../models/Product.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import CustomerPayment from '../models/CustomerPayment.js';
import VendorPayment from '../models/VendorPayment.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import JournalEntry from '../models/JournalEntry.js';
import AuditLog from '../models/AuditLog.js';
import { ROLES } from '../config/roles.js';

const DEFAULT_PASSWORD = 'Demo@123';

export const seedMultiCompanyEcosystem = async () => {
  console.log('🚀 Starting Full Multi-Company Ecosystem Seeding...');

  // ==========================================================================
  // HELPER: Ensure Accounts & General Journal exist for a business
  // ==========================================================================
  const ensureChartOfAccounts = async (businessId, companyCode, userId) => {
    const journalDefs = [
      { code: 'SJ', name: 'Sales Invoices Journal', type: 'sales' },
      { code: 'PJ', name: 'Vendor Purchases Journal', type: 'purchase' },
      { code: 'BNK', name: 'Bank Operations Journal', type: 'bank' },
      { code: 'CSH', name: 'Cash Transactions Book', type: 'cash' },
      { code: 'GEN', name: 'General Operations Ledger', type: 'general' }
    ];

    const journalMap = {};
    for (const j of journalDefs) {
      let doc = await Journal.findOne({ businessId, code: j.code });
      if (!doc) {
        doc = await Journal.create({
          businessId,
          code: j.code,
          name: j.name,
          journalType: j.type,
          isActive: true
        });
      }
      journalMap[j.code] = doc;
    }
    const generalJournal = journalMap['GEN'];

    let defaultAccounts = [];
    if (companyCode === 'APEX') {
      defaultAccounts = [
        { accountCode: '1010', accountName: 'HDFC Engineering Operating Bank', accountType: 'asset', currentBalance: 2450000 },
        { accountCode: '1020', accountName: 'ICICI Project Escrow Bank', accountType: 'asset', currentBalance: 980000 },
        { accountCode: '1050', accountName: 'Accounts Receivable (Turnkey Projects)', accountType: 'asset', currentBalance: 1621320 },
        { accountCode: '1080', accountName: 'Structural Steel & Architectural Stock', accountType: 'asset', currentBalance: 2066000 },
        { accountCode: '2010', accountName: 'Accounts Payable (Metal & Glass Suppliers)', accountType: 'liability', currentBalance: 283200 },
        { accountCode: '2050', accountName: 'GST & Works Contract Tax Payable', accountType: 'liability', currentBalance: 185000 },
        { accountCode: '3010', accountName: "Apex Founder Equity Capital", accountType: 'equity', currentBalance: 3500000 },
        { accountCode: '4010', accountName: 'Commercial Structural & Glazing Revenue', accountType: 'income', currentBalance: 3114020 },
        { accountCode: '5010', accountName: 'Direct Steel & Glass COGS', accountType: 'expense', currentBalance: 1640000 },
        { accountCode: '5050', accountName: 'Site Rigging, Logistics & Freight', accountType: 'expense', currentBalance: 380000 }
      ];
    } else if (companyCode === 'KAVERI') {
      defaultAccounts = [
        { accountCode: '1010', accountName: 'HDFC Luxury Hospitality Current Bank', accountType: 'asset', currentBalance: 4200000 },
        { accountCode: '1020', accountName: 'SBI Operations & Treasury Bank', accountType: 'asset', currentBalance: 1800000 },
        { accountCode: '1050', accountName: 'Accounts Receivable (Guest & Corp Accounts)', accountType: 'asset', currentBalance: 451350 },
        { accountCode: '1080', accountName: 'Resort Linens, Amenities & Suite Inventory', accountType: 'asset', currentBalance: 1745000 },
        { accountCode: '2010', accountName: 'Accounts Payable (Hospitality Suppliers)', accountType: 'liability', currentBalance: 212400 },
        { accountCode: '2050', accountName: 'Luxury Hospitality GST & Cess Payable', accountType: 'liability', currentBalance: 220000 },
        { accountCode: '3010', accountName: "Kaveri Partners Equity Capital", accountType: 'equity', currentBalance: 4500000 },
        { accountCode: '4010', accountName: 'Hospitality Suites & Retreats Revenue', accountType: 'income', currentBalance: 2586560 },
        { accountCode: '5010', accountName: 'Guest Amenities & Dining COGS', accountType: 'expense', currentBalance: 820000 },
        { accountCode: '5050', accountName: 'Resort Property Operations & Maintenance', accountType: 'expense', currentBalance: 310000 }
      ];
    } else {
      defaultAccounts = [
        { accountCode: '1010', accountName: 'Operating Current Bank', accountType: 'asset', currentBalance: 3000000 },
        { accountCode: '1020', accountName: 'Operational Treasury Bank', accountType: 'asset', currentBalance: 1000000 },
        { accountCode: '1050', accountName: 'Accounts Receivable (Debtors)', accountType: 'asset', currentBalance: 2000000 },
        { accountCode: '1080', accountName: 'Inventory & Raw Materials Stock', accountType: 'asset', currentBalance: 2500000 },
        { accountCode: '2010', accountName: 'Accounts Payable (Creditors)', accountType: 'liability', currentBalance: 1200000 },
        { accountCode: '2050', accountName: 'GST & Statutory Taxes Payable', accountType: 'liability', currentBalance: 300000 },
        { accountCode: '3010', accountName: "Owner's Equity Capital", accountType: 'equity', currentBalance: 5000000 },
        { accountCode: '4010', accountName: 'Commercial Sales Revenue', accountType: 'income', currentBalance: 5000000 },
        { accountCode: '5010', accountName: 'Direct Cost of Goods Sold (COGS)', accountType: 'expense', currentBalance: 2500000 },
        { accountCode: '5050', accountName: 'Power, Overheads & Freight', accountType: 'expense', currentBalance: 500000 }
      ];
    }

    const accountMap = {};
    for (const acc of defaultAccounts) {
      let doc = await Account.findOne({ businessId, accountCode: acc.accountCode });
      if (!doc) {
        doc = await Account.create({ businessId, ...acc, isActive: true });
      } else {
        doc.accountName = acc.accountName;
        doc.currentBalance = acc.currentBalance;
        await doc.save();
      }
      accountMap[acc.accountCode] = doc;
    }

    // Seed realistic Journal Entries
    const jeNum1 = `JE-${companyCode}-2026-001`;
    let je1 = await JournalEntry.findOne({ businessId, entryNumber: jeNum1 });
    if (!je1) {
      await JournalEntry.create({
        businessId,
        entryNumber: jeNum1,
        journalId: generalJournal._id,
        entryDate: new Date(Date.now() - 30 * 86400000),
        referenceType: 'Manual',
        description: 'Monthly commercial billing and accounts reconciliation',
        totalDebit: 1500000,
        totalCredit: 1500000,
        status: 'posted',
        createdBy: userId,
        lines: [
          {
            accountId: accountMap['1050']._id,
            accountNameSnapshot: accountMap['1050'].accountName,
            debit: 1500000,
            credit: 0,
            description: 'Commercial receivables ledger credit'
          },
          {
            accountId: accountMap['4010']._id,
            accountNameSnapshot: accountMap['4010'].accountName,
            debit: 0,
            credit: 1500000,
            description: 'Commercial sales recognized'
          }
        ]
      });
    }

    const jeNum2 = `JE-${companyCode}-2026-002`;
    let je2 = await JournalEntry.findOne({ businessId, entryNumber: jeNum2 });
    if (!je2) {
      await JournalEntry.create({
        businessId,
        entryNumber: jeNum2,
        journalId: generalJournal._id,
        entryDate: new Date(Date.now() - 15 * 86400000),
        referenceType: 'Manual',
        description: 'Raw material procurement and vendor payables accrual',
        totalDebit: 680000,
        totalCredit: 680000,
        status: 'posted',
        createdBy: userId,
        lines: [
          {
            accountId: accountMap['1080']._id,
            accountNameSnapshot: accountMap['1080'].accountName,
            debit: 680000,
            credit: 0,
            description: 'Stock intake'
          },
          {
            accountId: accountMap['2010']._id,
            accountNameSnapshot: accountMap['2010'].accountName,
            debit: 0,
            credit: 680000,
            description: 'Vendor accounts payable'
          }
        ]
      });
    }

    return { generalJournal, accountMap };
  };

  // ==========================================================================
  // 1. BUSINESS 1: CraftLedger Artisan Furnishings Pvt Ltd
  // ==========================================================================
  let craftOwner = await User.findOne({
    $or: [{ email: 'vidhitrivedi3110@gmail.com' }, { email: 'owner@craftledger.demo' }]
  });

  let craftBusiness;
  if (craftOwner?.businessId) {
    craftBusiness = await Business.findById(craftOwner.businessId);
    if (craftBusiness && (craftBusiness.businessName === 'Furniture' || !craftBusiness.businessName)) {
      craftBusiness.businessName = 'CraftLedger Artisan Furnishings Pvt Ltd';
      craftBusiness.legalName = 'CraftLedger Artisan Furnishings Private Limited';
      craftBusiness.city = 'Mumbai';
      craftBusiness.state = 'Maharashtra';
      craftBusiness.taxNumber = '27AABCC8901M1ZT';
      await craftBusiness.save();
    }
  }

  if (!craftBusiness) {
    craftBusiness = await Business.create({
      businessName: 'CraftLedger Artisan Furnishings Pvt Ltd',
      legalName: 'CraftLedger Artisan Furnishings Private Limited',
      email: 'contact@craftledger.com',
      phone: '+91 22 4589 1200',
      address: 'Plot 18, Industrial Craft Corridor, Kanjurmarg West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      currency: 'INR',
      taxNumber: '27AABCC8901M1ZT'
    });
  }

  if (!craftOwner) {
    craftOwner = await User.create({
      name: 'Vidhi Trivedi (Founder & MD)',
      email: 'vidhitrivedi3110@gmail.com',
      passwordHash: DEFAULT_PASSWORD,
      role: ROLES.BUSINESS_OWNER,
      businessId: craftBusiness._id,
      isActive: true
    });
  } else if (!craftOwner.businessId) {
    craftOwner.businessId = craftBusiness._id;
    await craftOwner.save();
  }

  console.log(`✅ [Business 1] ${craftBusiness.businessName} (Owner: ${craftOwner.email})`);
  await ensureChartOfAccounts(craftBusiness._id, 'CRAFT', craftOwner._id);

  // ==========================================================================
  // 2. BUSINESS 2: Apex Architectural Systems Pvt Ltd
  // ==========================================================================
  let apexBusiness = await Business.findOne({ businessName: 'Apex Architectural Systems Pvt Ltd' });
  if (!apexBusiness) {
    apexBusiness = await Business.create({
      businessName: 'Apex Architectural Systems Pvt Ltd',
      legalName: 'Apex Architectural Metal & Glazing Systems Private Limited',
      email: 'info@apexbuild.demo',
      phone: '+91 20 6712 4400',
      address: '702, Prime Tech Park, Hadapsar Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      currency: 'INR',
      taxNumber: '27AABCA4502L1ZQ'
    });
  }

  let apexOwner = await User.findOne({ email: 'rohit.sharma@apexbuild.demo' });
  if (!apexOwner) {
    apexOwner = await User.create({
      name: 'Rohit Sharma (CEO)',
      email: 'rohit.sharma@apexbuild.demo',
      passwordHash: DEFAULT_PASSWORD,
      role: ROLES.BUSINESS_OWNER,
      businessId: apexBusiness._id,
      isActive: true
    });
  }

  let apexAccountant = await User.findOne({ email: 'priya.accountant@apexbuild.demo' });
  if (!apexAccountant) {
    apexAccountant = await User.create({
      name: 'Priya Joshi (Head of Accounts)',
      email: 'priya.accountant@apexbuild.demo',
      passwordHash: DEFAULT_PASSWORD,
      role: ROLES.ACCOUNTANT,
      businessId: apexBusiness._id,
      isActive: true
    });
  }

  console.log(`✅ [Business 2] ${apexBusiness.businessName} (Owner: ${apexOwner.email})`);
  await ensureChartOfAccounts(apexBusiness._id, 'APEX', apexOwner._id);

  // ==========================================================================
  // 3. BUSINESS 3: Kaveri Hospitality Group Ltd
  // ==========================================================================
  let kaveriBusiness = await Business.findOne({ businessName: 'Kaveri Hospitality Group Ltd' });
  if (!kaveriBusiness) {
    kaveriBusiness = await Business.create({
      businessName: 'Kaveri Hospitality Group Ltd',
      legalName: 'Kaveri Luxury Hospitality & Living Spaces Limited',
      email: 'corporate@kaverihotels.demo',
      phone: '+91 80 4120 7800',
      address: '88, Residency Road, Shanthala Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      currency: 'INR',
      taxNumber: '29AABCK3309N1ZR'
    });
  }

  let kaveriOwner = await User.findOne({ email: 'ananya.deshmukh@kaverihotels.demo' });
  if (!kaveriOwner) {
    kaveriOwner = await User.create({
      name: 'Ananya Deshmukh (MD)',
      email: 'ananya.deshmukh@kaverihotels.demo',
      passwordHash: DEFAULT_PASSWORD,
      role: ROLES.BUSINESS_OWNER,
      businessId: kaveriBusiness._id,
      isActive: true
    });
  }

  let kaveriAccountant = await User.findOne({ email: 'vikram.accountant@kaverihotels.demo' });
  if (!kaveriAccountant) {
    kaveriAccountant = await User.create({
      name: 'Vikram Hegde (Finance Controller)',
      email: 'vikram.accountant@kaverihotels.demo',
      passwordHash: DEFAULT_PASSWORD,
      role: ROLES.ACCOUNTANT,
      businessId: kaveriBusiness._id,
      isActive: true
    });
  }

  console.log(`✅ [Business 3] ${kaveriBusiness.businessName} (Owner: ${kaveriOwner.email})`);
  await ensureChartOfAccounts(kaveriBusiness._id, 'KAVERI', kaveriOwner._id);

  // ==========================================================================
  // 4. APEX ARCHITECTURAL SYSTEMS: Products, Customers, Vendors & Transactions
  // ==========================================================================
  console.log('📦 Seeding Products & Operations for Apex Architectural Systems...');

  let apexCatMetal = await ProductCategory.findOne({ businessId: apexBusiness._id, name: 'Precision Metal Systems' });
  if (!apexCatMetal) {
    apexCatMetal = await ProductCategory.create({
      businessId: apexBusiness._id,
      name: 'Precision Metal Systems',
      description: 'Stainless steel frameworks, mounting brackets, and subassemblies',
      isActive: true
    });
  }

  let apexCatHardware = await ProductCategory.findOne({ businessId: apexBusiness._id, name: 'Architectural Hardware' });
  if (!apexCatHardware) {
    apexCatHardware = await ProductCategory.create({
      businessId: apexBusiness._id,
      name: 'Architectural Hardware',
      description: 'Solid brass pull handles, precision hinges, and heavy-duty concealed slides',
      isActive: true
    });
  }

  let apexCatGlass = await ProductCategory.findOne({ businessId: apexBusiness._id, name: 'Curtain Glazing & Facades' });
  if (!apexCatGlass) {
    apexCatGlass = await ProductCategory.create({
      businessId: apexBusiness._id,
      name: 'Curtain Glazing & Facades',
      description: 'Acoustic double-glazed glass partitions and exterior architectural facades',
      isActive: true
    });
  }

  const apexProducts = [
    {
      name: 'Modular Grade 304 Stainless Steel Frame (8ft)',
      sku: 'APEX-SS-FRM-01',
      categoryId: apexCatMetal._id,
      costPrice: 16500,
      sellingPrice: 28500,
      currentStock: 48,
      safetyStock: 10,
      reorderPoint: 15,
      unitOfMeasure: 'pcs',
      taxRate: 18,
      leadTimeDays: 7
    },
    {
      name: 'Bespoke Milled Solid Brass Pull Handle (Set of 2)',
      sku: 'APEX-BRS-HND-02',
      categoryId: apexCatHardware._id,
      costPrice: 1800,
      sellingPrice: 3800,
      currentStock: 180,
      safetyStock: 30,
      reorderPoint: 40,
      unitOfMeasure: 'set',
      taxRate: 18,
      leadTimeDays: 5
    },
    {
      name: 'Acoustic Double-Glazed Partition Glass Pane (6x4ft)',
      sku: 'APEX-GLS-PTN-03',
      categoryId: apexCatGlass._id,
      costPrice: 9200,
      sellingPrice: 16800,
      currentStock: 35,
      safetyStock: 8,
      reorderPoint: 12,
      unitOfMeasure: 'pcs',
      taxRate: 18,
      leadTimeDays: 10
    },
    {
      name: 'Heavy-Duty Concealed Hydraulic Soft-Close Pivot Hinge',
      sku: 'APEX-PIV-HNG-04',
      categoryId: apexCatHardware._id,
      costPrice: 2400,
      sellingPrice: 4900,
      currentStock: 95,
      safetyStock: 20,
      reorderPoint: 25,
      unitOfMeasure: 'pair',
      taxRate: 18,
      leadTimeDays: 4
    }
  ];

  const apexProductMap = {};
  for (const p of apexProducts) {
    let prod = await Product.findOne({ businessId: apexBusiness._id, sku: p.sku });
    if (!prod) {
      prod = await Product.create({ businessId: apexBusiness._id, ...p, isActive: true });
    }
    apexProductMap[p.sku] = prod;
  }

  // Apex Customers
  const apexCustomerDefs = [
    {
      name: 'Godrej Commercial Construction Ltd',
      email: 'projects@godrejconstruction.demo',
      phone: '+91 22 6796 5500',
      address: 'Pirojshanagar, Eastern Express Highway, Vikhroli, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      taxNumber: '27AABCG1204K1ZR',
      creditLimit: 3500000,
      paymentTerms: 'Net 45 days',
      contactType: 'customer'
    },
    {
      name: 'L&T Realty Infrastructure',
      email: 'procurement@ltrealty.demo',
      phone: '+91 20 6603 4000',
      address: 'L&T House, Shivaji Nagar, Pune',
      city: 'Pune',
      state: 'Maharashtra',
      taxNumber: '27AABCL8890P1ZN',
      creditLimit: 4500000,
      paymentTerms: 'Net 30 days',
      contactType: 'customer'
    },
    {
      name: 'Shapoorji Pallonji EPC Projects',
      email: 'projects@shapoorji.demo',
      phone: '+91 22 6749 0000',
      address: 'SP Centre, 41/44 Minoo Desai Marg, Colaba, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      taxNumber: '27AABCS7712M1Z8',
      creditLimit: 5000000,
      paymentTerms: 'Net 60 days',
      contactType: 'customer'
    },
    {
      name: 'CraftLedger Artisan Furnishings Pvt Ltd',
      email: 'procurement@craftledger.com',
      phone: '+91 22 4589 1200',
      address: 'Plot 18, Industrial Craft Corridor, Kanjurmarg West, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      taxNumber: '27AABCC8901M1ZT',
      creditLimit: 2500000,
      paymentTerms: 'Net 30 days',
      contactType: 'customer_and_vendor'
    }
  ];

  const apexContactMap = {};
  for (const c of apexCustomerDefs) {
    let contact = await Contact.findOne({ businessId: apexBusiness._id, email: c.email });
    if (!contact) {
      contact = await Contact.create({
        businessId: apexBusiness._id,
        ...c,
        hasLoginAccess: true,
        isActive: true
      });
    }
    apexContactMap[c.email] = contact;

    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({
        name: c.name,
        email: c.email,
        passwordHash: DEFAULT_PASSWORD,
        role: ROLES.CONTACT,
        businessId: apexBusiness._id,
        contactId: contact._id,
        createdBy: apexOwner._id,
        isActive: true
      });
      contact.userId = user._id;
      await contact.save();
    }

    const conNum = `CON-APEX-${contact.name.slice(0, 3).toUpperCase()}-2026`;
    let contract = await Contract.findOne({ businessId: apexBusiness._id, contractNumber: conNum });
    if (!contract) {
      await Contract.create({
        businessId: apexBusiness._id,
        contactId: contact._id,
        contractNumber: conNum,
        contractType: 'Commercial Architectural Supply Agreement',
        startDate: new Date(Date.now() - 45 * 86400000),
        endDate: new Date(Date.now() + 320 * 86400000),
        paymentTerms: c.paymentTerms,
        creditLimit: c.creditLimit,
        agreedTerms: `Direct supplier agreement with ${contact.name}. Covers custom precision metal framing and architectural hardware with guaranteed tier-1 quality certifications.`,
        billingAddress: c.address,
        shippingAddress: c.address,
        status: 'active'
      });
    }
  }

  // Apex Vendors
  const apexVendorDefs = [
    {
      name: 'Jindal Stainless Steel Mills Ltd',
      email: 'sales@jindalstainless.demo',
      phone: '+91 1662 222471',
      address: 'O.P. Jindal Marg, Hisar, Haryana',
      city: 'Hisar',
      state: 'Haryana',
      taxNumber: '06AABCJ4410R1ZP',
      creditLimit: 5000000,
      paymentTerms: 'Net 30 days',
      contactType: 'vendor'
    },
    {
      name: 'Saint-Gobain Architectural Glass',
      email: 'orders@saintgobain.demo',
      phone: '+91 44 4567 8900',
      address: 'World Glass Complex, Sriperumbudur, Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      taxNumber: '33AABCS1234N1ZT',
      creditLimit: 3000000,
      paymentTerms: 'Net 30 days',
      contactType: 'vendor'
    },
    {
      name: 'Hindalco Architectural Alloys Ltd',
      email: 'supplies@hindalco.demo',
      phone: '+91 22 6662 6666',
      address: 'Century Bhavan, Dr. Annie Besant Road, Worli, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      taxNumber: '27AAACH0098P1ZX',
      creditLimit: 4000000,
      paymentTerms: 'Net 45 days',
      contactType: 'vendor'
    }
  ];

  for (const v of apexVendorDefs) {
    let contact = await Contact.findOne({ businessId: apexBusiness._id, email: v.email });
    if (!contact) {
      contact = await Contact.create({
        businessId: apexBusiness._id,
        ...v,
        hasLoginAccess: true,
        isActive: true
      });
    }
    apexContactMap[v.email] = contact;

    let user = await User.findOne({ email: v.email });
    if (!user) {
      user = await User.create({
        name: v.name,
        email: v.email,
        passwordHash: DEFAULT_PASSWORD,
        role: ROLES.CONTACT,
        businessId: apexBusiness._id,
        contactId: contact._id,
        createdBy: apexOwner._id,
        isActive: true
      });
      contact.userId = user._id;
      await contact.save();
    }

    const conNum = `CON-APEX-${contact.name.slice(0, 3).toUpperCase()}-VEN-2026`;
    let contract = await Contract.findOne({ businessId: apexBusiness._id, contractNumber: conNum });
    if (!contract) {
      await Contract.create({
        businessId: apexBusiness._id,
        contactId: contact._id,
        contractNumber: conNum,
        contractType: 'Raw Material Procurement Framework',
        startDate: new Date(Date.now() - 90 * 86400000),
        endDate: new Date(Date.now() + 275 * 86400000),
        paymentTerms: v.paymentTerms,
        creditLimit: v.creditLimit,
        agreedTerms: `Direct master vendor contract with ${contact.name} for prime grade raw materials, mill test certificates, and scheduled factory drop-shipments.`,
        billingAddress: v.address,
        shippingAddress: apexBusiness.address,
        status: 'active'
      });
    }
  }

  // Apex Sales Orders & Invoices
  const ssFrame = apexProductMap['APEX-SS-FRM-01'];
  const brassPulls = apexProductMap['APEX-BRS-HND-02'];
  const glassPane = apexProductMap['APEX-GLS-PTN-03'];
  const pivotHinge = apexProductMap['APEX-PIV-HNG-04'];

  const godrejCust = apexContactMap['projects@godrejconstruction.demo'];
  const ltCust = apexContactMap['procurement@ltrealty.demo'];
  const shapoorjiCust = apexContactMap['projects@shapoorji.demo'];
  const craftCust = apexContactMap['procurement@craftledger.com'];

  // 1. Apex SO to Godrej
  if (godrejCust && ssFrame && brassPulls) {
    let godrejSO = await SalesOrder.findOne({ businessId: apexBusiness._id, orderNumber: 'SO-APEX-GDJ-01' });
    if (!godrejSO) {
      const subtotal = (ssFrame.sellingPrice * 10) + (brassPulls.sellingPrice * 50);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;
      godrejSO = await SalesOrder.create({
        businessId: apexBusiness._id,
        orderNumber: 'SO-APEX-GDJ-01',
        customerId: godrejCust._id,
        orderDate: new Date(Date.now() - 15 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 15 * 86400000),
        items: [
          {
            productId: ssFrame._id,
            productNameSnapshot: ssFrame.name,
            skuSnapshot: ssFrame.sku,
            quantity: 10,
            unitPrice: ssFrame.sellingPrice,
            costPriceSnapshot: ssFrame.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: ssFrame.sellingPrice * 10
          },
          {
            productId: brassPulls._id,
            productNameSnapshot: brassPulls.name,
            skuSnapshot: brassPulls.sku,
            quantity: 50,
            unitPrice: brassPulls.sellingPrice,
            costPriceSnapshot: brassPulls.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: brassPulls.sellingPrice * 50
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'partially_paid',
        notes: 'Commercial hardware delivery for Godrej Vikhroli Towers project.',
        createdBy: apexOwner._id
      });

      const invTotal = total;
      const paid = Math.round(total * 0.4);
      let inv = await CustomerInvoice.create({
        businessId: apexBusiness._id,
        invoiceNumber: 'INV-APEX-GDJ-001',
        salesOrderId: godrejSO._id,
        customerId: godrejCust._id,
        invoiceDate: new Date(Date.now() - 12 * 86400000),
        dueDate: new Date(Date.now() + 33 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: invTotal,
        paidAmount: paid,
        balanceDue: invTotal - paid,
        status: 'partially_paid',
        createdBy: apexOwner._id
      });

      await CustomerPayment.create({
        businessId: apexBusiness._id,
        paymentNumber: 'PAY-APEX-GDJ-01',
        invoiceId: inv._id,
        customerId: godrejCust._id,
        paymentDate: new Date(Date.now() - 10 * 86400000),
        amount: paid,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'HDFC-CORP-334910',
        notes: '40% advance mobilization deposit.',
        createdBy: apexOwner._id
      });
    }
  }

  // 2. Apex SO to L&T Realty
  if (ltCust && glassPane && pivotHinge) {
    let ltSO = await SalesOrder.findOne({ businessId: apexBusiness._id, orderNumber: 'SO-APEX-LT-02' });
    if (!ltSO) {
      const subtotal = (glassPane.sellingPrice * 25) + (pivotHinge.sellingPrice * 50);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;
      ltSO = await SalesOrder.create({
        businessId: apexBusiness._id,
        orderNumber: 'SO-APEX-LT-02',
        customerId: ltCust._id,
        orderDate: new Date(Date.now() - 22 * 86400000),
        expectedDeliveryDate: new Date(Date.now() - 2 * 86400000),
        items: [
          {
            productId: glassPane._id,
            productNameSnapshot: glassPane.name,
            skuSnapshot: glassPane.sku,
            quantity: 25,
            unitPrice: glassPane.sellingPrice,
            costPriceSnapshot: glassPane.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: glassPane.sellingPrice * 25
          },
          {
            productId: pivotHinge._id,
            productNameSnapshot: pivotHinge.name,
            skuSnapshot: pivotHinge.sku,
            quantity: 50,
            unitPrice: pivotHinge.sellingPrice,
            costPriceSnapshot: pivotHinge.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: pivotHinge.sellingPrice * 50
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'delivered',
        paymentStatus: 'paid',
        notes: 'Acoustic glass partitions for Pune Tech Park Level 4 & 5.',
        createdBy: apexOwner._id
      });

      let inv = await CustomerInvoice.create({
        businessId: apexBusiness._id,
        invoiceNumber: 'INV-APEX-LT-002',
        salesOrderId: ltSO._id,
        customerId: ltCust._id,
        invoiceDate: new Date(Date.now() - 20 * 86400000),
        dueDate: new Date(Date.now() + 10 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: apexOwner._id
      });

      await CustomerPayment.create({
        businessId: apexBusiness._id,
        paymentNumber: 'PAY-APEX-LT-02',
        invoiceId: inv._id,
        customerId: ltCust._id,
        paymentDate: new Date(Date.now() - 5 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'ICICI-NEFT-889104',
        notes: 'Cleared in full upon site delivery inspection.',
        createdBy: apexOwner._id
      });
    }
  }

  // 3. Apex SO to CraftLedger
  if (craftCust && ssFrame && brassPulls) {
    let craftSO = await SalesOrder.findOne({ businessId: apexBusiness._id, orderNumber: 'SO-APEX-CRF-03' });
    if (!craftSO) {
      const subtotal = (ssFrame.sellingPrice * 8) + (brassPulls.sellingPrice * 40);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;
      craftSO = await SalesOrder.create({
        businessId: apexBusiness._id,
        orderNumber: 'SO-APEX-CRF-03',
        customerId: craftCust._id,
        orderDate: new Date(Date.now() - 8 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 10 * 86400000),
        items: [
          {
            productId: ssFrame._id,
            productNameSnapshot: ssFrame.name,
            skuSnapshot: ssFrame.sku,
            quantity: 8,
            unitPrice: ssFrame.sellingPrice,
            costPriceSnapshot: ssFrame.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: ssFrame.sellingPrice * 8
          },
          {
            productId: brassPulls._id,
            productNameSnapshot: brassPulls.name,
            skuSnapshot: brassPulls.sku,
            quantity: 40,
            unitPrice: brassPulls.sellingPrice,
            costPriceSnapshot: brassPulls.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: brassPulls.sellingPrice * 40
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'B2B metal frames supplied to CraftLedger for executive conference tables.',
        createdBy: apexOwner._id
      });

      let inv = await CustomerInvoice.create({
        businessId: apexBusiness._id,
        invoiceNumber: 'INV-APEX-CRF-003',
        salesOrderId: craftSO._id,
        customerId: craftCust._id,
        invoiceDate: new Date(Date.now() - 6 * 86400000),
        dueDate: new Date(Date.now() + 24 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: apexOwner._id
      });

      await CustomerPayment.create({
        businessId: apexBusiness._id,
        paymentNumber: 'PAY-APEX-CRF-03',
        invoiceId: inv._id,
        customerId: craftCust._id,
        paymentDate: new Date(Date.now() - 4 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'HDFC-RTGS-772190',
        notes: 'Cleared in full by CraftLedger finance.',
        createdBy: apexOwner._id
      });
    }
  }

  // 4. Apex SO to Shapoorji Pallonji
  if (shapoorjiCust && glassPane && ssFrame) {
    let spSO = await SalesOrder.findOne({ businessId: apexBusiness._id, orderNumber: 'SO-APEX-SP-04' });
    if (!spSO) {
      const subtotal = (glassPane.sellingPrice * 30) + (ssFrame.sellingPrice * 15);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;
      spSO = await SalesOrder.create({
        businessId: apexBusiness._id,
        orderNumber: 'SO-APEX-SP-04',
        customerId: shapoorjiCust._id,
        orderDate: new Date(Date.now() - 5 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 25 * 86400000),
        items: [
          {
            productId: glassPane._id,
            productNameSnapshot: glassPane.name,
            skuSnapshot: glassPane.sku,
            quantity: 30,
            unitPrice: glassPane.sellingPrice,
            costPriceSnapshot: glassPane.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: glassPane.sellingPrice * 30
          },
          {
            productId: ssFrame._id,
            productNameSnapshot: ssFrame.name,
            skuSnapshot: ssFrame.sku,
            quantity: 15,
            unitPrice: ssFrame.sellingPrice,
            costPriceSnapshot: ssFrame.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: ssFrame.sellingPrice * 15
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'processing',
        paymentStatus: 'unpaid',
        notes: 'Facade elements for Shapoorji Colaba luxury residential towers.',
        createdBy: apexOwner._id
      });

      await CustomerInvoice.create({
        businessId: apexBusiness._id,
        invoiceNumber: 'INV-APEX-SP-004',
        salesOrderId: spSO._id,
        customerId: shapoorjiCust._id,
        invoiceDate: new Date(Date.now() - 3 * 86400000),
        dueDate: new Date(Date.now() + 57 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: 0,
        balanceDue: total,
        status: 'issued',
        createdBy: apexOwner._id
      });
    }
  }

  // Apex Purchase Orders to Vendors
  const jindalVen = apexContactMap['sales@jindalstainless.demo'];
  const sgVen = apexContactMap['orders@saintgobain.demo'];
  const hinVen = apexContactMap['supplies@hindalco.demo'];

  // PO 1: Jindal Stainless
  if (jindalVen && ssFrame) {
    let jindalPO = await PurchaseOrder.findOne({ businessId: apexBusiness._id, purchaseOrderNumber: 'PO-APEX-JIN-01' });
    if (!jindalPO) {
      const subtotal = 450000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      jindalPO = await PurchaseOrder.create({
        businessId: apexBusiness._id,
        purchaseOrderNumber: 'PO-APEX-JIN-01',
        vendorId: jindalVen._id,
        orderDate: new Date(Date.now() - 25 * 86400000),
        expectedDeliveryDate: new Date(Date.now() - 5 * 86400000),
        items: [
          {
            productId: ssFrame._id,
            productNameSnapshot: 'Raw Grade 304 Stainless Steel Extruded Coil',
            skuSnapshot: 'RAW-SS-COIL',
            quantity: 25,
            receivedQuantity: 25,
            unitCost: 18000,
            taxRate: 18,
            lineTotal: subtotal
          }
        ],
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: 'received',
        paymentStatus: 'paid',
        notes: 'Monthly grade 304 raw stainless coils for factory extrusion.',
        createdBy: apexOwner._id
      });

      let bill = await VendorBill.create({
        businessId: apexBusiness._id,
        billNumber: 'BILL-APEX-JIN-001',
        purchaseOrderId: jindalPO._id,
        vendorId: jindalVen._id,
        billDate: new Date(Date.now() - 22 * 86400000),
        dueDate: new Date(Date.now() + 8 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: apexOwner._id
      });

      await VendorPayment.create({
        businessId: apexBusiness._id,
        paymentNumber: 'VPAY-APEX-JIN-01',
        billId: bill._id,
        vendorId: jindalVen._id,
        paymentDate: new Date(Date.now() - 10 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'AXIS-RTGS-991204',
        notes: 'Cleared invoice in full via treasury.',
        createdBy: apexOwner._id
      });
    }
  }

  // PO 2: Saint-Gobain Glass
  if (sgVen && glassPane) {
    let sgPO = await PurchaseOrder.findOne({ businessId: apexBusiness._id, purchaseOrderNumber: 'PO-APEX-SG-02' });
    if (!sgPO) {
      const subtotal = 320000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      sgPO = await PurchaseOrder.create({
        businessId: apexBusiness._id,
        purchaseOrderNumber: 'PO-APEX-SG-02',
        vendorId: sgVen._id,
        orderDate: new Date(Date.now() - 18 * 86400000),
        expectedDeliveryDate: new Date(Date.now() - 3 * 86400000),
        items: [
          {
            productId: glassPane._id,
            productNameSnapshot: 'Acoustic Laminated Annealed Float Glass',
            skuSnapshot: 'RAW-GLS-SGB',
            quantity: 35,
            receivedQuantity: 35,
            unitCost: 9142,
            taxRate: 18,
            lineTotal: subtotal
          }
        ],
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: 'received',
        paymentStatus: 'paid',
        notes: 'High acoustic rating laminated float glass panes.',
        createdBy: apexOwner._id
      });

      let bill = await VendorBill.create({
        businessId: apexBusiness._id,
        billNumber: 'BILL-APEX-SG-002',
        purchaseOrderId: sgPO._id,
        vendorId: sgVen._id,
        billDate: new Date(Date.now() - 15 * 86400000),
        dueDate: new Date(Date.now() + 15 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: apexOwner._id
      });

      await VendorPayment.create({
        businessId: apexBusiness._id,
        paymentNumber: 'VPAY-APEX-SG-02',
        billId: bill._id,
        vendorId: sgVen._id,
        paymentDate: new Date(Date.now() - 6 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'HDFC-RTGS-554109',
        notes: 'Cleared in full.',
        createdBy: apexOwner._id
      });
    }
  }

  // PO 3: Hindalco Alloys
  if (hinVen && ssFrame) {
    let hinPO = await PurchaseOrder.findOne({ businessId: apexBusiness._id, purchaseOrderNumber: 'PO-APEX-HIN-03' });
    if (!hinPO) {
      const subtotal = 240000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      hinPO = await PurchaseOrder.create({
        businessId: apexBusiness._id,
        purchaseOrderNumber: 'PO-APEX-HIN-03',
        vendorId: hinVen._id,
        orderDate: new Date(Date.now() - 7 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 14 * 86400000),
        items: [
          {
            productId: ssFrame._id,
            productNameSnapshot: 'High Tensile Structural Alloy Billets',
            skuSnapshot: 'RAW-ALU-HIN',
            quantity: 20,
            receivedQuantity: 20,
            unitCost: 12000,
            taxRate: 18,
            lineTotal: subtotal
          }
        ],
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: 'received',
        paymentStatus: 'unpaid',
        notes: 'Structural alloy billet shipment for curtain facade extrusions.',
        createdBy: apexOwner._id
      });

      await VendorBill.create({
        businessId: apexBusiness._id,
        billNumber: 'BILL-APEX-HIN-003',
        purchaseOrderId: hinPO._id,
        vendorId: hinVen._id,
        billDate: new Date(Date.now() - 4 * 86400000),
        dueDate: new Date(Date.now() + 41 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: 0,
        balanceDue: total,
        status: 'issued',
        createdBy: apexOwner._id
      });
    }
  }

  // ==========================================================================
  // 5. KAVERI HOSPITALITY GROUP: Offerings, Customers, Vendors & Transactions
  // ==========================================================================
  console.log('🏨 Seeding Offerings & Operations for Kaveri Hospitality Group...');

  let kaveriCatStay = await ProductCategory.findOne({ businessId: kaveriBusiness._id, name: 'Luxury Villas & Living Suites' });
  if (!kaveriCatStay) {
    kaveriCatStay = await ProductCategory.create({
      businessId: kaveriBusiness._id,
      name: 'Luxury Villas & Living Suites',
      description: 'Private infinity-pool villas, presidential penthouses, and heritage heritage suites',
      isActive: true
    });
  }

  let kaveriCatBanquets = await ProductCategory.findOne({ businessId: kaveriBusiness._id, name: 'Banquets & Corporate Conferences' });
  if (!kaveriCatBanquets) {
    kaveriCatBanquets = await ProductCategory.create({
      businessId: kaveriBusiness._id,
      name: 'Banquets & Corporate Conferences',
      description: 'Grand columnless ballrooms, CXO boardrooms, and gourmet banqueting covers',
      isActive: true
    });
  }

  const kaveriProducts = [
    {
      name: 'Private Infinity-Pool Luxury Heritage Villa (Per Night)',
      sku: 'KAV-VILLA-01',
      categoryId: kaveriCatStay._id,
      costPrice: 9500,
      sellingPrice: 28000,
      currentStock: 25,
      safetyStock: 5,
      reorderPoint: 8,
      unitOfMeasure: 'night',
      taxRate: 18,
      leadTimeDays: 1
    },
    {
      name: 'Royal Grand Ballroom Full Day Package (Includes AV & Catering)',
      sku: 'KAV-BLRM-PKG-02',
      categoryId: kaveriCatBanquets._id,
      costPrice: 85000,
      sellingPrice: 195000,
      currentStock: 12,
      safetyStock: 2,
      reorderPoint: 3,
      unitOfMeasure: 'package',
      taxRate: 18,
      leadTimeDays: 2
    },
    {
      name: 'Executive Boardroom CXO Suite with Concierge AV',
      sku: 'KAV-CONF-03',
      categoryId: kaveriCatBanquets._id,
      costPrice: 15000,
      sellingPrice: 45000,
      currentStock: 15,
      safetyStock: 3,
      reorderPoint: 5,
      unitOfMeasure: 'day',
      taxRate: 18,
      leadTimeDays: 1
    },
    {
      name: 'Gourmet Multi-Cuisine Banqueting Cover (Per Pax)',
      sku: 'KAV-BNQ-COV-04',
      categoryId: kaveriCatBanquets._id,
      costPrice: 850,
      sellingPrice: 2400,
      currentStock: 450,
      safetyStock: 50,
      reorderPoint: 100,
      unitOfMeasure: 'pax',
      taxRate: 18,
      leadTimeDays: 1
    }
  ];

  const kaveriProductMap = {};
  for (const p of kaveriProducts) {
    let prod = await Product.findOne({ businessId: kaveriBusiness._id, sku: p.sku });
    if (!prod) {
      prod = await Product.create({ businessId: kaveriBusiness._id, ...p, isActive: true });
    }
    kaveriProductMap[p.sku] = prod;
  }

  // Kaveri Customers
  const kaveriCustomerDefs = [
    {
      name: 'Infosys Leadership Institute',
      email: 'retreats@infosys.demo',
      phone: '+91 80 2852 0261',
      address: '44, Electronics City, Hosur Road, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      taxNumber: '29AAACI4400N1Z2',
      creditLimit: 5000000,
      paymentTerms: 'Net 45 days',
      contactType: 'customer'
    },
    {
      name: 'McKinsey & Company India',
      email: 'events@mckinsey-india.demo',
      phone: '+91 80 6691 1000',
      address: 'UB City, Vittal Mallya Road, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      taxNumber: '29AABCM1122D1ZY',
      creditLimit: 4000000,
      paymentTerms: 'Net 30 days',
      contactType: 'customer'
    },
    {
      name: 'Wipro Corporate Global Events',
      email: 'events@wipro.demo',
      phone: '+91 80 2844 0011',
      address: 'Doddakannelli, Sarjapur Road, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      taxNumber: '29AABCW3312Q1ZL',
      creditLimit: 4500000,
      paymentTerms: 'Net 30 days',
      contactType: 'customer'
    },
    {
      name: 'CraftLedger Artisan Furnishings Pvt Ltd',
      email: 'contact@craftledger.demo',
      phone: '+91 22 4589 1200',
      address: 'Plot 18, Industrial Craft Corridor, Kanjurmarg West, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      taxNumber: '27AABCC8901M1ZT',
      creditLimit: 2000000,
      paymentTerms: 'Net 30 days',
      contactType: 'customer_and_vendor'
    }
  ];

  const kaveriContactMap = {};
  for (const c of kaveriCustomerDefs) {
    let contact = await Contact.findOne({ businessId: kaveriBusiness._id, email: c.email });
    if (!contact) {
      contact = await Contact.create({
        businessId: kaveriBusiness._id,
        ...c,
        hasLoginAccess: true,
        isActive: true
      });
    }
    kaveriContactMap[c.email] = contact;

    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({
        name: c.name,
        email: c.email,
        passwordHash: DEFAULT_PASSWORD,
        role: ROLES.CONTACT,
        businessId: kaveriBusiness._id,
        contactId: contact._id,
        createdBy: kaveriOwner._id,
        isActive: true
      });
      contact.userId = user._id;
      await contact.save();
    }

    const conNum = `CON-KAV-${contact.name.slice(0, 3).toUpperCase()}-2026`;
    let contract = await Contract.findOne({ businessId: kaveriBusiness._id, contractNumber: conNum });
    if (!contract) {
      await Contract.create({
        businessId: kaveriBusiness._id,
        contactId: contact._id,
        contractNumber: conNum,
        contractType: 'Annual Corporate Hospitality Retainer',
        startDate: new Date(Date.now() - 60 * 86400000),
        endDate: new Date(Date.now() + 305 * 86400000),
        paymentTerms: c.paymentTerms,
        creditLimit: c.creditLimit,
        agreedTerms: `Exclusive annual master hospitality agreement with ${contact.name} covering quarterly leadership conferences, executive suites, and catering packages.`,
        billingAddress: c.address,
        shippingAddress: c.address,
        status: 'active'
      });
    }
  }

  // Kaveri Vendors
  const kaveriVendorDefs = [
    {
      name: 'CraftLedger Artisan Furnishings Pvt Ltd',
      email: 'sales@craftledger.com',
      phone: '+91 22 4589 1200',
      address: 'Plot 18, Industrial Craft Corridor, Kanjurmarg West, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      taxNumber: '27AABCC8901M1ZT',
      creditLimit: 3500000,
      paymentTerms: 'Net 45 days',
      contactType: 'vendor'
    },
    {
      name: 'Taj Luxury Linen & Textiles Ltd',
      email: 'supplies@tajlinen.demo',
      phone: '+91 40 6666 3939',
      address: 'Road No. 1, Banjara Hills, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      taxNumber: '36AABCT9920K1ZX',
      creditLimit: 2000000,
      paymentTerms: 'Net 30 days',
      contactType: 'vendor'
    },
    {
      name: 'Sula Vineyards & Gourmet Cellars',
      email: 'orders@sulawines.demo',
      phone: '+91 253 302 7777',
      address: 'Gat 36/2, Govardhan Village, Off Gangapur-Savargaon Road, Nashik',
      city: 'Nashik',
      state: 'Maharashtra',
      taxNumber: '27AABCS6601D1ZM',
      creditLimit: 1500000,
      paymentTerms: 'Net 30 days',
      contactType: 'vendor'
    }
  ];

  for (const v of kaveriVendorDefs) {
    let contact = await Contact.findOne({ businessId: kaveriBusiness._id, email: v.email });
    if (!contact) {
      contact = await Contact.create({
        businessId: kaveriBusiness._id,
        ...v,
        hasLoginAccess: true,
        isActive: true
      });
    }
    kaveriContactMap[v.email] = contact;

    let user = await User.findOne({ email: v.email });
    if (!user) {
      user = await User.create({
        name: v.name,
        email: v.email,
        passwordHash: DEFAULT_PASSWORD,
        role: ROLES.CONTACT,
        businessId: kaveriBusiness._id,
        contactId: contact._id,
        createdBy: kaveriOwner._id,
        isActive: true
      });
      contact.userId = user._id;
      await contact.save();
    }

    const conNum = `CON-KAV-${contact.name.slice(0, 3).toUpperCase()}-VEN-2026`;
    let contract = await Contract.findOne({ businessId: kaveriBusiness._id, contractNumber: conNum });
    if (!contract) {
      await Contract.create({
        businessId: kaveriBusiness._id,
        contactId: contact._id,
        contractNumber: conNum,
        contractType: 'Master Hospitality Supplier Agreement',
        startDate: new Date(Date.now() - 75 * 86400000),
        endDate: new Date(Date.now() + 290 * 86400000),
        paymentTerms: v.paymentTerms,
        creditLimit: v.creditLimit,
        agreedTerms: `Supply contract with ${contact.name} for bespoke hotel villa furnishings, luxury linen sets, and fine culinary provisions.`,
        billingAddress: v.address,
        shippingAddress: kaveriBusiness.address,
        status: 'active'
      });
    }
  }

  // Kaveri Sales Orders & Invoices
  const ballroomPkg = kaveriProductMap['KAV-BLRM-PKG-02'];
  const villaSuite = kaveriProductMap['KAV-VILLA-01'];
  const confSuite = kaveriProductMap['KAV-CONF-03'];
  const banqCover = kaveriProductMap['KAV-BNQ-COV-04'];

  const infosysCust = kaveriContactMap['retreats@infosys.demo'];
  const mckinseyCust = kaveriContactMap['events@mckinsey-india.demo'];
  const wiproCust = kaveriContactMap['events@wipro.demo'];
  const craftLedgerCust = kaveriContactMap['contact@craftledger.demo'];

  // 1. Kaveri SO to Infosys
  if (infosysCust && ballroomPkg && villaSuite) {
    let infSO = await SalesOrder.findOne({ businessId: kaveriBusiness._id, orderNumber: 'SO-KAV-INF-01' });
    if (!infSO) {
      const subtotal = (ballroomPkg.sellingPrice * 2) + (villaSuite.sellingPrice * 20);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      infSO = await SalesOrder.create({
        businessId: kaveriBusiness._id,
        orderNumber: 'SO-KAV-INF-01',
        customerId: infosysCust._id,
        orderDate: new Date(Date.now() - 14 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 10 * 86400000),
        items: [
          {
            productId: ballroomPkg._id,
            productNameSnapshot: ballroomPkg.name,
            skuSnapshot: ballroomPkg.sku,
            quantity: 2,
            unitPrice: ballroomPkg.sellingPrice,
            costPriceSnapshot: ballroomPkg.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: ballroomPkg.sellingPrice * 2
          },
          {
            productId: villaSuite._id,
            productNameSnapshot: villaSuite.name,
            skuSnapshot: villaSuite.sku,
            quantity: 20,
            unitPrice: villaSuite.sellingPrice,
            costPriceSnapshot: villaSuite.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: villaSuite.sellingPrice * 20
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'Infosys Annual Global Strategy Retreat 2026.',
        createdBy: kaveriOwner._id
      });

      let inv = await CustomerInvoice.create({
        businessId: kaveriBusiness._id,
        invoiceNumber: 'INV-KAV-INF-001',
        salesOrderId: infSO._id,
        customerId: infosysCust._id,
        invoiceDate: new Date(Date.now() - 10 * 86400000),
        dueDate: new Date(Date.now() + 35 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: kaveriOwner._id
      });

      await CustomerPayment.create({
        businessId: kaveriBusiness._id,
        paymentNumber: 'PAY-KAV-INF-01',
        invoiceId: inv._id,
        customerId: infosysCust._id,
        paymentDate: new Date(Date.now() - 5 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'INFY-TREASURY-00918',
        notes: 'Full clearance of retreat booking package.',
        createdBy: kaveriOwner._id
      });
    }
  }

  // 2. Kaveri SO to McKinsey India
  if (mckinseyCust && confSuite && villaSuite && banqCover) {
    let mckSO = await SalesOrder.findOne({ businessId: kaveriBusiness._id, orderNumber: 'SO-KAV-MCK-02' });
    if (!mckSO) {
      const subtotal = (confSuite.sellingPrice * 3) + (villaSuite.sellingPrice * 12) + (banqCover.sellingPrice * 80);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      mckSO = await SalesOrder.create({
        businessId: kaveriBusiness._id,
        orderNumber: 'SO-KAV-MCK-02',
        customerId: mckinseyCust._id,
        orderDate: new Date(Date.now() - 20 * 86400000),
        expectedDeliveryDate: new Date(Date.now() - 2 * 86400000),
        items: [
          {
            productId: confSuite._id,
            productNameSnapshot: confSuite.name,
            skuSnapshot: confSuite.sku,
            quantity: 3,
            unitPrice: confSuite.sellingPrice,
            costPriceSnapshot: confSuite.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: confSuite.sellingPrice * 3
          },
          {
            productId: villaSuite._id,
            productNameSnapshot: villaSuite.name,
            skuSnapshot: villaSuite.sku,
            quantity: 12,
            unitPrice: villaSuite.sellingPrice,
            costPriceSnapshot: villaSuite.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: villaSuite.sellingPrice * 12
          },
          {
            productId: banqCover._id,
            productNameSnapshot: banqCover.name,
            skuSnapshot: banqCover.sku,
            quantity: 80,
            unitPrice: banqCover.sellingPrice,
            costPriceSnapshot: banqCover.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: banqCover.sellingPrice * 80
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'delivered',
        paymentStatus: 'paid',
        notes: 'McKinsey CXO Strategy Retreat & Private Banquets.',
        createdBy: kaveriOwner._id
      });

      let inv = await CustomerInvoice.create({
        businessId: kaveriBusiness._id,
        invoiceNumber: 'INV-KAV-MCK-002',
        salesOrderId: mckSO._id,
        customerId: mckinseyCust._id,
        invoiceDate: new Date(Date.now() - 18 * 86400000),
        dueDate: new Date(Date.now() + 12 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: kaveriOwner._id
      });

      await CustomerPayment.create({
        businessId: kaveriBusiness._id,
        paymentNumber: 'PAY-KAV-MCK-02',
        invoiceId: inv._id,
        customerId: mckinseyCust._id,
        paymentDate: new Date(Date.now() - 4 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'MCK-CORP-440192',
        notes: 'Cleared invoice in full.',
        createdBy: kaveriOwner._id
      });
    }
  }

  // 3. Kaveri SO to Wipro
  if (wiproCust && ballroomPkg && banqCover) {
    let wipSO = await SalesOrder.findOne({ businessId: kaveriBusiness._id, orderNumber: 'SO-KAV-WIP-03' });
    if (!wipSO) {
      const subtotal = (ballroomPkg.sellingPrice * 3) + (banqCover.sellingPrice * 150);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      wipSO = await SalesOrder.create({
        businessId: kaveriBusiness._id,
        orderNumber: 'SO-KAV-WIP-03',
        customerId: wiproCust._id,
        orderDate: new Date(Date.now() - 6 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 20 * 86400000),
        items: [
          {
            productId: ballroomPkg._id,
            productNameSnapshot: ballroomPkg.name,
            skuSnapshot: ballroomPkg.sku,
            quantity: 3,
            unitPrice: ballroomPkg.sellingPrice,
            costPriceSnapshot: ballroomPkg.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: ballroomPkg.sellingPrice * 3
          },
          {
            productId: banqCover._id,
            productNameSnapshot: banqCover.name,
            skuSnapshot: banqCover.sku,
            quantity: 150,
            unitPrice: banqCover.sellingPrice,
            costPriceSnapshot: banqCover.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: banqCover.sellingPrice * 150
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'partially_paid',
        notes: 'Wipro Global Tech Summit 2026.',
        createdBy: kaveriOwner._id
      });

      const invTotal = total;
      const paid = Math.round(total * 0.5);
      let inv = await CustomerInvoice.create({
        businessId: kaveriBusiness._id,
        invoiceNumber: 'INV-KAV-WIP-003',
        salesOrderId: wipSO._id,
        customerId: wiproCust._id,
        invoiceDate: new Date(Date.now() - 4 * 86400000),
        dueDate: new Date(Date.now() + 26 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: invTotal,
        paidAmount: paid,
        balanceDue: invTotal - paid,
        status: 'partially_paid',
        createdBy: kaveriOwner._id
      });

      await CustomerPayment.create({
        businessId: kaveriBusiness._id,
        paymentNumber: 'PAY-KAV-WIP-03',
        invoiceId: inv._id,
        customerId: wiproCust._id,
        paymentDate: new Date(Date.now() - 2 * 86400000),
        amount: paid,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'WIPRO-HDFC-991204',
        notes: '50% advance mobilization deposit.',
        createdBy: kaveriOwner._id
      });
    }
  }

  // 4. Kaveri SO to CraftLedger
  if (craftLedgerCust && confSuite && villaSuite) {
    let crfSO = await SalesOrder.findOne({ businessId: kaveriBusiness._id, orderNumber: 'SO-KAV-CRF-04' });
    if (!crfSO) {
      const subtotal = (confSuite.sellingPrice * 2) + (villaSuite.sellingPrice * 8);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      crfSO = await SalesOrder.create({
        businessId: kaveriBusiness._id,
        orderNumber: 'SO-KAV-CRF-04',
        customerId: craftLedgerCust._id,
        orderDate: new Date(Date.now() - 11 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 15 * 86400000),
        items: [
          {
            productId: confSuite._id,
            productNameSnapshot: confSuite.name,
            skuSnapshot: confSuite.sku,
            quantity: 2,
            unitPrice: confSuite.sellingPrice,
            costPriceSnapshot: confSuite.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: confSuite.sellingPrice * 2
          },
          {
            productId: villaSuite._id,
            productNameSnapshot: villaSuite.name,
            skuSnapshot: villaSuite.sku,
            quantity: 8,
            unitPrice: villaSuite.sellingPrice,
            costPriceSnapshot: villaSuite.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: villaSuite.sellingPrice * 8
          }
        ],
        subtotal,
        discount: 0,
        taxAmount: tax,
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: 'CraftLedger Design Leadership Offsite 2026.',
        createdBy: kaveriOwner._id
      });

      let inv = await CustomerInvoice.create({
        businessId: kaveriBusiness._id,
        invoiceNumber: 'INV-KAV-CRF-004',
        salesOrderId: crfSO._id,
        customerId: craftLedgerCust._id,
        invoiceDate: new Date(Date.now() - 9 * 86400000),
        dueDate: new Date(Date.now() + 21 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: kaveriOwner._id
      });

      await CustomerPayment.create({
        businessId: kaveriBusiness._id,
        paymentNumber: 'PAY-KAV-CRF-04',
        invoiceId: inv._id,
        customerId: craftLedgerCust._id,
        paymentDate: new Date(Date.now() - 3 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'CRAFT-HDFC-661902',
        notes: 'Cleared in full by CraftLedger finance.',
        createdBy: kaveriOwner._id
      });
    }
  }

  // Kaveri Purchase Orders to Vendors
  const craftVen = kaveriContactMap['sales@craftledger.com'];
  const tajVen = kaveriContactMap['supplies@tajlinen.demo'];
  const sulaVen = kaveriContactMap['orders@sulawines.demo'];

  // PO 1: Kaveri purchasing bespoke furnishings from CraftLedger
  if (craftVen && villaSuite) {
    let crfPO = await PurchaseOrder.findOne({ businessId: kaveriBusiness._id, purchaseOrderNumber: 'PO-KAV-CRF-01' });
    if (!crfPO) {
      const subtotal = 720000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      crfPO = await PurchaseOrder.create({
        businessId: kaveriBusiness._id,
        purchaseOrderNumber: 'PO-KAV-CRF-01',
        vendorId: craftVen._id,
        orderDate: new Date(Date.now() - 35 * 86400000),
        expectedDeliveryDate: new Date(Date.now() - 10 * 86400000),
        items: [
          {
            productId: villaSuite._id,
            productNameSnapshot: 'CraftLedger Teak Heritage Lounge Suites (10 Sets)',
            skuSnapshot: 'FURN-TEAK-VIL',
            quantity: 10,
            receivedQuantity: 10,
            unitCost: 72000,
            taxRate: 18,
            lineTotal: subtotal
          }
        ],
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: 'received',
        paymentStatus: 'paid',
        notes: 'Bespoke solid teak lounge furnishings for luxury resort villas.',
        createdBy: kaveriOwner._id
      });

      let bill = await VendorBill.create({
        businessId: kaveriBusiness._id,
        billNumber: 'BILL-KAV-CRF-001',
        purchaseOrderId: crfPO._id,
        vendorId: craftVen._id,
        billDate: new Date(Date.now() - 30 * 86400000),
        dueDate: new Date(Date.now() + 15 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: kaveriOwner._id
      });

      await VendorPayment.create({
        businessId: kaveriBusiness._id,
        paymentNumber: 'VPAY-KAV-CRF-01',
        billId: bill._id,
        vendorId: craftVen._id,
        paymentDate: new Date(Date.now() - 12 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'KAV-HDFC-RTGS-3310',
        notes: 'Full payment cleared to CraftLedger.',
        createdBy: kaveriOwner._id
      });
    }
  }

  // PO 2: Kaveri purchasing luxury linen from Taj Linen
  if (tajVen && villaSuite) {
    let tajPO = await PurchaseOrder.findOne({ businessId: kaveriBusiness._id, purchaseOrderNumber: 'PO-KAV-TAJ-02' });
    if (!tajPO) {
      const subtotal = 310000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      tajPO = await PurchaseOrder.create({
        businessId: kaveriBusiness._id,
        purchaseOrderNumber: 'PO-KAV-TAJ-02',
        vendorId: tajVen._id,
        orderDate: new Date(Date.now() - 22 * 86400000),
        expectedDeliveryDate: new Date(Date.now() - 5 * 86400000),
        items: [
          {
            productId: villaSuite._id,
            productNameSnapshot: 'Taj Luxury 400TC Egyptian Cotton Bedding Sets',
            skuSnapshot: 'LIN-EGY-400TC',
            quantity: 50,
            receivedQuantity: 50,
            unitCost: 6200,
            taxRate: 18,
            lineTotal: subtotal
          }
        ],
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: 'received',
        paymentStatus: 'paid',
        notes: 'Annual luxury suite linen replenishment.',
        createdBy: kaveriOwner._id
      });

      let bill = await VendorBill.create({
        businessId: kaveriBusiness._id,
        billNumber: 'BILL-KAV-TAJ-002',
        purchaseOrderId: tajPO._id,
        vendorId: tajVen._id,
        billDate: new Date(Date.now() - 19 * 86400000),
        dueDate: new Date(Date.now() + 11 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: total,
        balanceDue: 0,
        status: 'paid',
        createdBy: kaveriOwner._id
      });

      await VendorPayment.create({
        businessId: kaveriBusiness._id,
        paymentNumber: 'VPAY-KAV-TAJ-02',
        billId: bill._id,
        vendorId: tajVen._id,
        paymentDate: new Date(Date.now() - 8 * 86400000),
        amount: total,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'KAV-ICICI-881902',
        notes: 'Cleared in full.',
        createdBy: kaveriOwner._id
      });
    }
  }

  // PO 3: Kaveri purchasing wine and gourmet beverages from Sula
  if (sulaVen && banqCover) {
    let sulaPO = await PurchaseOrder.findOne({ businessId: kaveriBusiness._id, purchaseOrderNumber: 'PO-KAV-SUL-03' });
    if (!sulaPO) {
      const subtotal = 180000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      sulaPO = await PurchaseOrder.create({
        businessId: kaveriBusiness._id,
        purchaseOrderNumber: 'PO-KAV-SUL-03',
        vendorId: sulaVen._id,
        orderDate: new Date(Date.now() - 8 * 86400000),
        expectedDeliveryDate: new Date(Date.now() + 12 * 86400000),
        items: [
          {
            productId: banqCover._id,
            productNameSnapshot: 'Sula Estate Reserve Cellar Cases (60 Cases)',
            skuSnapshot: 'FNB-SUL-CASE',
            quantity: 60,
            receivedQuantity: 60,
            unitCost: 3000,
            taxRate: 18,
            lineTotal: subtotal
          }
        ],
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: 'received',
        paymentStatus: 'unpaid',
        notes: 'Banqueting and cellar provisions for corporate event bookings.',
        createdBy: kaveriOwner._id
      });

      await VendorBill.create({
        businessId: kaveriBusiness._id,
        billNumber: 'BILL-KAV-SUL-003',
        purchaseOrderId: sulaPO._id,
        vendorId: sulaVen._id,
        billDate: new Date(Date.now() - 5 * 86400000),
        dueDate: new Date(Date.now() + 25 * 86400000),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: 0,
        balanceDue: total,
        status: 'issued',
        createdBy: kaveriOwner._id
      });
    }
  }

  // ==========================================================================
  // 6. PLATFORM AUDIT LOGS (For Admin Oversight)
  // ==========================================================================
  console.log('📋 Seeding Realistic Platform Audit Logs for Admin Portal...');
  const auditEntries = [
    {
      businessId: craftBusiness._id,
      userId: craftOwner._id,
      role: 'business_owner',
      action: 'UPDATE_CONTRACT',
      module: 'Contracts',
      description: 'Renewed master reciprocal supply contract CON-APEX-CRA-2026 with Apex Architectural Systems.',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    },
    {
      businessId: apexBusiness._id,
      userId: apexOwner._id,
      role: 'business_owner',
      action: 'CONFIRM_SALES_ORDER',
      module: 'Sales',
      description: 'Confirmed architectural hardware sales order SO-APEX-GDJ-01 (₹4,48,400) for Godrej Construction.',
      ipAddress: '192.168.2.18',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    },
    {
      businessId: apexBusiness._id,
      userId: apexAccountant._id,
      role: 'accountant',
      action: 'GENERATE_INVOICE',
      module: 'Accounting',
      description: 'Issued GST tax invoice INV-APEX-LT-002 for L&T Realty Infrastructure.',
      ipAddress: '192.168.2.22',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    },
    {
      businessId: kaveriBusiness._id,
      userId: kaveriOwner._id,
      role: 'business_owner',
      action: 'RECEIVE_PAYMENT',
      module: 'Payments',
      description: 'Reconciled corporate advance payment PAY-KAV-INF-01 (₹7,55,200) from Infosys Leadership Institute.',
      ipAddress: '192.168.3.99',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      businessId: kaveriBusiness._id,
      userId: kaveriAccountant._id,
      role: 'accountant',
      action: 'APPROVE_PURCHASE_ORDER',
      module: 'Purchases',
      description: 'Approved PO-KAV-CRF-01 for bespoke luxury villa furnishings from CraftLedger Furnishings.',
      ipAddress: '192.168.3.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    },
    {
      businessId: craftBusiness._id,
      userId: craftOwner._id,
      role: 'business_owner',
      action: 'RUN_AI_ML_INFERENCE',
      module: 'ML Intelligence',
      description: 'Triggered automated 30-day cash flow forecast and profit leak audit on active ledger.',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    },
    {
      businessId: apexBusiness._id,
      userId: apexOwner._id,
      role: 'business_owner',
      action: 'RECONCILE_BANK_TRANSACTION',
      module: 'Banking',
      description: 'Automated match of NEFT settlement PAY-APEX-LT-02 against HDFC current account.',
      ipAddress: '192.168.2.18',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    },
    {
      businessId: kaveriBusiness._id,
      userId: kaveriOwner._id,
      role: 'business_owner',
      action: 'SIGN_CONTRACT',
      module: 'Contracts',
      description: 'Executed annual corporate retainer contract CON-KAV-INF-2026 with Infosys Leadership Institute.',
      ipAddress: '192.168.3.99',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      businessId: craftBusiness._id,
      userId: craftOwner._id,
      role: 'business_owner',
      action: 'UPDATE_INVENTORY',
      module: 'Inventory',
      description: 'Adjusted safety stock and reorder points for teak dining tables and credenzas.',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0'
    }
  ];

  for (const log of auditEntries) {
    await AuditLog.create(log);
  }

  console.log('🎉 Multi-Company Ecosystem, B2B Commercial Contracts, and Operations Successfully Seeded!');

  return {
    success: true,
    companies: [
      { name: craftBusiness.businessName, owner: craftOwner.email },
      { name: apexBusiness.businessName, owner: apexOwner.email },
      { name: kaveriBusiness.businessName, owner: kaveriOwner.email }
    ]
  };
};

if (process.argv[1]?.includes('seedMultiCompanyEcosystem.js')) {
  connectDB().then(async () => {
    try {
      const res = await seedMultiCompanyEcosystem();
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}
