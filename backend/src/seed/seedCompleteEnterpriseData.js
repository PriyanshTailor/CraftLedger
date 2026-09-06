import mongoose from 'mongoose';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import ProductCategory from '../models/ProductCategory.js';
import Product from '../models/Product.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import JournalEntry from '../models/JournalEntry.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import StockMovement from '../models/StockMovement.js';
import Budget from '../models/Budget.js';

export const seedCompleteEnterpriseData = async () => {
  const owner = await User.findOne({ email: 'vidhitrivedi3110@gmail.com' });
  if (!owner?.businessId) {
    throw new Error('Business Owner vidhitrivedi3110@gmail.com not found.');
  }

  const businessId = owner.businessId;
  const userId = owner._id;

  console.log(`Starting complete enterprise data seeding for Business: ${businessId}...`);

  // ==========================================
  // 1. PRODUCT CATEGORIES
  // ==========================================
  console.log('Seeding Product Categories...');
  const categoryDefs = [
    { name: 'Living & Lounge Furniture', description: 'Luxury handcrafted credenzas, coffee tables, armchairs and consoles' },
    { name: 'Dining & Hospitality Suites', description: 'Solid wood conference & banquet tables, dining sets, restaurant booth units' },
    { name: 'Bedroom & Suite Collections', description: 'Heritage carved king beds, nightstands, and dressing consoles' },
    { name: 'Office & Workstation Pods', description: 'Acoustic focus pods, executive desks, and co-working island desks' },
    { name: 'Raw Timber & Fine Hardwoods', description: 'Seasoned Burma Teak, Sheesham, White Oak, and Smoked Eucalyptus veneers' },
    { name: 'Hardware, Finishes & Leather', description: 'Architectural brass pulls, PU lacquer coatings, and Italian upholstery leather' }
  ];

  const categoryMap = {};
  for (const cat of categoryDefs) {
    let doc = await ProductCategory.findOne({ businessId, name: cat.name });
    if (!doc) {
      doc = await ProductCategory.create({ businessId, ...cat, isActive: true });
    }
    categoryMap[cat.name] = doc._id;
  }

  // ==========================================
  // 2. PRODUCTS (Finished Goods & Materials)
  // ==========================================
  console.log('Seeding Finished Goods & Raw Material Products...');
  const productDefs = [
    // Finished Goods
    {
      category: 'Living & Lounge Furniture',
      name: 'Fluted Teak Credenza & Buffet Table',
      sku: 'FURN-CRD-001',
      description: 'Handcrafted solid teak sideboard with fluted tambour doors and brushed brass legs.',
      unit: 'pcs',
      costPrice: 42000,
      sellingPrice: 85000,
      taxRate: 18,
      quantityOnHand: 8,
      reorderLevel: 3
    },
    {
      category: 'Dining & Hospitality Suites',
      name: 'Solid Sheesham 10-Seater Conference Table',
      sku: 'FURN-TBL-002',
      description: 'Single-slab Sheesham wood conference table with integrated concealed wire management.',
      unit: 'pcs',
      costPrice: 72000,
      sellingPrice: 145000,
      taxRate: 18,
      quantityOnHand: 5,
      reorderLevel: 2
    },
    {
      category: 'Living & Lounge Furniture',
      name: 'Velvet Dining & Lounge Chair (Set of 4)',
      sku: 'FURN-CHR-003',
      description: 'Ergonomic high-density foam dining chair with cognac Italian velvet upholstery.',
      unit: 'set',
      costPrice: 16000,
      sellingPrice: 32000,
      taxRate: 18,
      quantityOnHand: 18,
      reorderLevel: 6
    },
    {
      category: 'Office & Workstation Pods',
      name: 'Minimalist Scandinavian Oak Desk',
      sku: 'FURN-DSK-004',
      description: 'Solid white oak executive desk with soft-close drawers and cable tray.',
      unit: 'pcs',
      costPrice: 19000,
      sellingPrice: 36000,
      taxRate: 18,
      quantityOnHand: 12,
      reorderLevel: 4
    },
    {
      category: 'Bedroom & Suite Collections',
      name: 'Heritage Carved Teak King Bed Frame',
      sku: 'FURN-BED-005',
      description: 'Artisan hand-carved Rajasthan heritage king bed with brass inlay headboard.',
      unit: 'pcs',
      costPrice: 58000,
      sellingPrice: 110000,
      taxRate: 18,
      quantityOnHand: 6,
      reorderLevel: 2
    },
    {
      category: 'Living & Lounge Furniture',
      name: 'Marble Top Brass Inlay Coffee Table',
      sku: 'FURN-COF-006',
      description: 'Italian Carrara marble coffee table with geometric solid brass base.',
      unit: 'pcs',
      costPrice: 21000,
      sellingPrice: 42000,
      taxRate: 18,
      quantityOnHand: 14,
      reorderLevel: 4
    },
    {
      category: 'Office & Workstation Pods',
      name: '4-Person Island Workstation Pod',
      sku: 'FURN-POD-007',
      description: 'Modular commercial co-working workstation with acoustic privacy dividers.',
      unit: 'pcs',
      costPrice: 28000,
      sellingPrice: 55000,
      taxRate: 18,
      quantityOnHand: 9,
      reorderLevel: 3
    },
    {
      category: 'Dining & Hospitality Suites',
      name: 'Outdoor Weatherproof Teak Bistro Table',
      sku: 'FURN-OUT-008',
      description: 'Grade-A marine grade plantation teak table designed for luxury cafe patios.',
      unit: 'pcs',
      costPrice: 17000,
      sellingPrice: 34000,
      taxRate: 18,
      quantityOnHand: 16,
      reorderLevel: 5
    },
    {
      category: 'Bedroom & Suite Collections',
      name: 'Handcrafted Antique Brass Nightstand (Pair)',
      sku: 'FURN-NST-009',
      description: 'Pair of walnut veneer nightstands with antique fluted brass hardware.',
      unit: 'pair',
      costPrice: 24000,
      sellingPrice: 48000,
      taxRate: 18,
      quantityOnHand: 11,
      reorderLevel: 4
    },
    {
      category: 'Dining & Hospitality Suites',
      name: 'Upholstered Banquet Booth Unit (4-Seater)',
      sku: 'FURN-BTH-010',
      description: 'Commercial tufted banquet dining booth with stain-resistant velvet.',
      unit: 'pcs',
      costPrice: 22000,
      sellingPrice: 42000,
      taxRate: 18,
      quantityOnHand: 7,
      reorderLevel: 2
    },

    // Raw Materials & Supplies
    {
      category: 'Raw Timber & Fine Hardwoods',
      name: 'Seasoned Burma Teak Timber Logs (100 cft)',
      sku: 'RAW-TEAK-101',
      description: 'Kiln-dried Grade-A Burma teak timber for furniture manufacturing.',
      unit: 'cft',
      costPrice: 1250,
      sellingPrice: 1750,
      taxRate: 18,
      quantityOnHand: 180,
      reorderLevel: 50
    },
    {
      category: 'Hardware, Finishes & Leather',
      name: 'Architectural Brass Pull Handles (Box of 50)',
      sku: 'RAW-BRSS-102',
      description: 'Solid knurled brass drawer pulls and cabinet handles.',
      unit: 'box',
      costPrice: 12500,
      sellingPrice: 18000,
      taxRate: 18,
      quantityOnHand: 25,
      reorderLevel: 8
    },
    {
      category: 'Raw Timber & Fine Hardwoods',
      name: 'Smoked Eucalyptus Decorative Veneer Sheets (25 sheets)',
      sku: 'RAW-VEN-103',
      description: 'Natural exotic wood veneer sheets (8x4 ft) for premium surface finishes.',
      unit: 'pack',
      costPrice: 28000,
      sellingPrice: 38000,
      taxRate: 18,
      quantityOnHand: 15,
      reorderLevel: 5
    },
    {
      category: 'Hardware, Finishes & Leather',
      name: 'Top-Grain Italian Cognac Leather Hide (50 sqft)',
      sku: 'RAW-LTH-104',
      description: 'Semi-aniline Italian upholstery leather hide for armchairs and dining sets.',
      unit: 'hide',
      costPrice: 22000,
      sellingPrice: 31000,
      taxRate: 18,
      quantityOnHand: 20,
      reorderLevel: 6
    },
    {
      category: 'Hardware, Finishes & Leather',
      name: '2-Pack PU Clear Wood Lacquer & Sealer (20L drum)',
      sku: 'RAW-POL-105',
      description: 'High-durability matte polyurethane wood finish with UV stabilizer.',
      unit: 'drum',
      costPrice: 9500,
      sellingPrice: 13500,
      taxRate: 18,
      quantityOnHand: 30,
      reorderLevel: 10
    },
    {
      category: 'Hardware, Finishes & Leather',
      name: 'High-Density 40-Density Upholstery Foam (Sheet 72x36x4")',
      sku: 'RAW-FOM-106',
      description: 'Virgin high-resilience foam for luxury sofa and chair seating cushions.',
      unit: 'sheet',
      costPrice: 2800,
      sellingPrice: 4200,
      taxRate: 18,
      quantityOnHand: 45,
      reorderLevel: 15
    }
  ];

  const productMap = {};
  let totalInventoryVal = 0;

  for (const p of productDefs) {
    const categoryId = categoryMap[p.category];
    const inventoryValue = p.quantityOnHand * p.costPrice;
    totalInventoryVal += inventoryValue;

    let doc = await Product.findOne({ businessId, sku: p.sku });
    if (!doc) {
      doc = await Product.create({
        businessId,
        categoryId,
        name: p.name,
        sku: p.sku,
        description: p.description,
        unit: p.unit,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        taxRate: p.taxRate,
        quantityOnHand: p.quantityOnHand,
        reorderLevel: p.reorderLevel,
        inventoryValue,
        isActive: true
      });
    } else {
      doc.quantityOnHand = p.quantityOnHand;
      doc.inventoryValue = inventoryValue;
      await doc.save();
    }
    productMap[p.sku] = doc;
  }

  // ==========================================
  // 3. CHART OF ACCOUNTS
  // ==========================================
  console.log('Seeding Chart of Accounts...');
  const accountDefs = [
    { code: '1010', name: 'Operating Bank Account (HDFC)', type: 'asset', balance: 485000 },
    { code: '1020', name: 'Petty Cash Account', type: 'asset', balance: 25000 },
    { code: '1200', name: 'Accounts Receivable (Trade Debtors)', type: 'asset', balance: 4161860 },
    { code: '1400', name: 'Finished Furniture & Materials Inventory', type: 'asset', balance: totalInventoryVal },
    { code: '2000', name: 'Accounts Payable (Trade Creditors)', type: 'liability', balance: 1310980 },
    { code: '2200', name: 'GST Output Tax Payable', type: 'liability', balance: 374000 },
    { code: '3000', name: "Owner's Equity & Capital", type: 'equity', balance: 2500000 },
    { code: '3100', name: 'Retained Earnings', type: 'equity', balance: 1200000 },
    { code: '4000', name: 'Finished Furniture Sales Revenue', type: 'income', balance: 4161860 },
    { code: '4100', name: 'Architectural & Custom Project Revenue', type: 'income', balance: 750000 },
    { code: '5000', name: 'Cost of Goods Sold (Timber & Production)', type: 'expense', balance: 1850000 },
    { code: '6000', name: 'Workshop & Showroom Lease Rent', type: 'expense', balance: 180000 },
    { code: '6100', name: 'Artisan Carpenter & Craftsmen Payroll', type: 'expense', balance: 240000 },
    { code: '6200', name: 'Workshop Power & Tooling Utilities', type: 'expense', balance: 45000 }
  ];

  const accountMap = {};
  for (const acc of accountDefs) {
    let doc = await Account.findOne({ businessId, accountCode: acc.code });
    if (!doc) {
      doc = await Account.create({
        businessId,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        openingBalance: acc.balance,
        currentBalance: acc.balance,
        isActive: true
      });
    } else {
      doc.accountName = acc.name;
      doc.accountType = acc.type;
      doc.currentBalance = acc.balance;
      await doc.save();
    }
    accountMap[acc.code] = doc;
  }

  // ==========================================
  // 4. JOURNALS
  // ==========================================
  console.log('Seeding Accounting Journals...');
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

  // ==========================================
  // 5. SALES ORDERS (Linked to Customers & Products)
  // ==========================================
  console.log('Seeding Sales Orders...');
  const customers = await Contact.find({ businessId, contactType: 'customer' });
  const finishedProductSkus = ['FURN-CRD-001', 'FURN-TBL-002', 'FURN-CHR-003', 'FURN-DSK-004', 'FURN-BED-005', 'FURN-COF-006', 'FURN-POD-007', 'FURN-OUT-008', 'FURN-NST-009', 'FURN-BTH-010'];

  let salesOrderCount = 0;
  for (let idx = 0; idx < customers.length; idx++) {
    const cust = customers[idx];
    const orderNum = `SO-2026-${String(idx + 1).padStart(4, '0')}`;
    let existingSO = await SalesOrder.findOne({ businessId, orderNumber: orderNum });

    if (!existingSO) {
      const p1 = productMap[finishedProductSkus[idx % finishedProductSkus.length]];
      const p2 = productMap[finishedProductSkus[(idx + 2) % finishedProductSkus.length]];

      const q1 = (idx % 3) + 1;
      const q2 = (idx % 2) + 1;

      const line1Sub = p1.sellingPrice * q1;
      const line1Tax = Math.round(line1Sub * 0.18);
      const line2Sub = p2.sellingPrice * q2;
      const line2Tax = Math.round(line2Sub * 0.18);

      const subtotal = line1Sub + line2Sub;
      const taxAmount = line1Tax + line2Tax;
      const totalAmount = subtotal + taxAmount;

      const statuses = ['confirmed', 'processing', 'delivered', 'draft'];
      const status = statuses[idx % statuses.length];
      const paymentStatuses = ['paid', 'partially_paid', 'unpaid'];
      const paymentStatus = paymentStatuses[idx % paymentStatuses.length];

      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - (30 - idx * 2));
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 14);

      await SalesOrder.create({
        businessId,
        orderNumber: orderNum,
        customerId: cust._id,
        orderDate,
        expectedDeliveryDate: deliveryDate,
        items: [
          {
            productId: p1._id,
            productNameSnapshot: p1.name,
            skuSnapshot: p1.sku,
            quantity: q1,
            unitPrice: p1.sellingPrice,
            costPriceSnapshot: p1.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: line1Sub + line1Tax
          },
          {
            productId: p2._id,
            productNameSnapshot: p2.name,
            skuSnapshot: p2.sku,
            quantity: q2,
            unitPrice: p2.sellingPrice,
            costPriceSnapshot: p2.costPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: line2Sub + line2Tax
          }
        ],
        subtotal,
        discount: 0,
        taxAmount,
        totalAmount,
        status,
        paymentStatus,
        notes: `Contract for ${cust.name} architectural furniture deployment.`,
        createdBy: userId
      });
      salesOrderCount++;
    }
  }

  // ==========================================
  // 6. PURCHASE ORDERS (Linked to Vendors & Materials)
  // ==========================================
  console.log('Seeding Purchase Orders...');
  const vendors = await Contact.find({ businessId, contactType: 'vendor' });
  const rawProductSkus = ['RAW-TEAK-101', 'RAW-BRSS-102', 'RAW-VEN-103', 'RAW-LTH-104', 'RAW-POL-105', 'RAW-FOM-106'];

  let purchaseOrderCount = 0;
  for (let idx = 0; idx < vendors.length; idx++) {
    const vend = vendors[idx];
    const poNum = `PO-2026-${String(idx + 1).padStart(4, '0')}`;
    let existingPO = await PurchaseOrder.findOne({ businessId, purchaseOrderNumber: poNum });

    if (!existingPO) {
      const p1 = productMap[rawProductSkus[idx % rawProductSkus.length]];
      const q1 = (idx % 4 + 2) * 5;
      const line1Sub = p1.costPrice * q1;
      const line1Tax = Math.round(line1Sub * 0.18);
      const totalAmount = line1Sub + line1Tax;

      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - (40 - idx * 2));
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 10);

      const statuses = ['received', 'confirmed', 'partially_received'];
      const status = statuses[idx % statuses.length];

      await PurchaseOrder.create({
        businessId,
        purchaseOrderNumber: poNum,
        vendorId: vend._id,
        orderDate,
        expectedDeliveryDate: deliveryDate,
        items: [
          {
            productId: p1._id,
            productNameSnapshot: p1.name,
            skuSnapshot: p1.sku,
            quantity: q1,
            receivedQuantity: status === 'received' ? q1 : Math.round(q1 / 2),
            unitCost: p1.costPrice,
            taxRate: 18,
            lineTotal: totalAmount
          }
        ],
        subtotal: line1Sub,
        taxAmount: line1Tax,
        totalAmount,
        status,
        paymentStatus: status === 'received' ? 'paid' : 'partially_paid',
        notes: `Supply delivery for workshop batch from ${vend.name}.`,
        createdBy: userId
      });
      purchaseOrderCount++;
    }
  }

  // ==========================================
  // 7. JOURNAL ENTRIES (Double Entry Bookkeeping)
  // ==========================================
  console.log('Seeding Double-Entry Journal Entries...');
  const salesJournal = journalMap['SJ'];
  const purchaseJournal = journalMap['PJ'];
  const bankJournal = journalMap['BNK'];
  const generalJournal = journalMap['GEN'];

  const arAcc = accountMap['1200'];
  const revAcc = accountMap['4000'];
  const gstAcc = accountMap['2200'];
  const bankAcc = accountMap['1010'];
  const apAcc = accountMap['2000'];
  const cogsAcc = accountMap['5000'];
  const rentAcc = accountMap['6000'];
  const payrollAcc = accountMap['6100'];

  const journalEntryDefs = [
    {
      num: 'JE-2026-001',
      date: new Date('2026-08-10'),
      journalId: salesJournal._id,
      desc: 'Billed luxury furniture dispatch to Amber Luxe Interiors',
      lines: [
        { accountId: arAcc._id, accountNameSnapshot: arAcc.accountName, debit: 100300, credit: 0, description: 'Receivable for Credenza order' },
        { accountId: revAcc._id, accountNameSnapshot: revAcc.accountName, debit: 0, credit: 85000, description: 'Furniture sales revenue' },
        { accountId: gstAcc._id, accountNameSnapshot: gstAcc.accountName, debit: 0, credit: 15300, description: '18% GST output tax' }
      ]
    },
    {
      num: 'JE-2026-002',
      date: new Date('2026-08-14'),
      journalId: purchaseJournal._id,
      desc: 'Raw timber log consignment from Saraswati Timber Works',
      lines: [
        { accountId: cogsAcc._id, accountNameSnapshot: cogsAcc.accountName, debit: 125000, credit: 0, description: 'Raw Teak timber inventory intake' },
        { accountId: apAcc._id, accountNameSnapshot: apAcc.accountName, debit: 0, credit: 125000, description: 'Payable to Saraswati Timber' }
      ]
    },
    {
      num: 'JE-2026-003',
      date: new Date('2026-08-20'),
      journalId: bankJournal._id,
      desc: 'NEFT Customer Payment received from Studio Vistara Architects',
      lines: [
        { accountId: bankAcc._id, accountNameSnapshot: bankAcc.accountName, debit: 171100, credit: 0, description: 'Bank deposit cleared' },
        { accountId: arAcc._id, accountNameSnapshot: arAcc.accountName, debit: 0, credit: 171100, description: 'Clear AR balance' }
      ]
    },
    {
      num: 'JE-2026-004',
      date: new Date('2026-08-25'),
      journalId: bankJournal._id,
      desc: 'Vendor settlement paid to Apex Architectural Brass & Hardware',
      lines: [
        { accountId: apAcc._id, accountNameSnapshot: apAcc.accountName, debit: 45430, credit: 0, description: 'Accounts payable settled' },
        { accountId: bankAcc._id, accountNameSnapshot: bankAcc.accountName, debit: 0, credit: 45430, description: 'Disbursed via HDFC bank transfer' }
      ]
    },
    {
      num: 'JE-2026-005',
      date: new Date('2026-08-31'),
      journalId: generalJournal._id,
      desc: 'Monthly workshop and design studio lease rent for August',
      lines: [
        { accountId: rentAcc._id, accountNameSnapshot: rentAcc.accountName, debit: 90000, credit: 0, description: 'Workshop lease operational cost' },
        { accountId: bankAcc._id, accountNameSnapshot: bankAcc.accountName, debit: 0, credit: 90000, description: 'Bank rent deduction' }
      ]
    },
    {
      num: 'JE-2026-006',
      date: new Date('2026-08-31'),
      journalId: generalJournal._id,
      desc: 'August artisan master carpenters and assembly team payroll',
      lines: [
        { accountId: payrollAcc._id, accountNameSnapshot: payrollAcc.accountName, debit: 120000, credit: 0, description: 'Artisan salary expense' },
        { accountId: bankAcc._id, accountNameSnapshot: bankAcc.accountName, debit: 0, credit: 120000, description: 'Direct salary bank transfer' }
      ]
    }
  ];

  let journalEntryCount = 0;
  for (const je of journalEntryDefs) {
    let existingJE = await JournalEntry.findOne({ businessId, entryNumber: je.num });
    if (!existingJE) {
      const totDebit = je.lines.reduce((s, l) => s + l.debit, 0);
      const totCredit = je.lines.reduce((s, l) => s + l.credit, 0);

      await JournalEntry.create({
        businessId,
        entryNumber: je.num,
        entryDate: je.date,
        journalId: je.journalId,
        referenceType: 'Manual',
        description: je.desc,
        lines: je.lines,
        totalDebit: totDebit,
        totalCredit: totCredit,
        status: 'posted',
        createdBy: userId
      });
      journalEntryCount++;
    }
  }

  // ==========================================
  // 8. STOCK MOVEMENTS
  // ==========================================
  console.log('Seeding Stock Movements...');
  let stockMovementCount = 0;
  for (const sku of ['FURN-CRD-001', 'FURN-TBL-002', 'FURN-CHR-003', 'RAW-TEAK-101', 'RAW-BRSS-102']) {
    const prod = productMap[sku];
    const existingSM = await StockMovement.findOne({ businessId, productId: prod._id });
    if (!existingSM) {
      await StockMovement.create({
        businessId,
        productId: prod._id,
        movementType: 'purchase',
        quantity: prod.quantityOnHand,
        previousQuantity: 0,
        newQuantity: prod.quantityOnHand,
        unitCost: prod.costPrice,
        totalValue: prod.quantityOnHand * prod.costPrice,
        referenceType: 'Manual',
        notes: `Initial warehouse inventory intake for ${prod.name}`,
        createdBy: userId
      });
      stockMovementCount++;
    }
  }

  // ==========================================
  // 9. BUDGETS
  // ==========================================
  console.log('Seeding Operating Budgets...');
  const budgetDefs = [
    {
      name: 'Q3/Q4 Fine Hardwoods & Timber Procurement',
      plannedAmount: 1500000,
      actualAmount: 840000,
      periodStart: new Date('2026-07-01'),
      periodEnd: new Date('2026-12-31')
    },
    {
      name: 'Workshop Modernization & CNC Machinery',
      plannedAmount: 600000,
      actualAmount: 320000,
      periodStart: new Date('2026-07-01'),
      periodEnd: new Date('2026-12-31')
    },
    {
      name: 'Architectural Catalog & Design Expo Showcase',
      plannedAmount: 400000,
      actualAmount: 180000,
      periodStart: new Date('2026-08-01'),
      periodEnd: new Date('2026-11-30')
    }
  ];

  let budgetCount = 0;
  for (const b of budgetDefs) {
    let existingB = await Budget.findOne({ businessId, name: b.name });
    if (!existingB) {
      const varianceAmount = b.plannedAmount - b.actualAmount;
      const variancePercentage = Math.round((varianceAmount / b.plannedAmount) * 100);
      await Budget.create({
        businessId,
        name: b.name,
        periodStart: b.periodStart,
        periodEnd: b.periodEnd,
        plannedAmount: b.plannedAmount,
        actualAmount: b.actualAmount,
        varianceAmount,
        variancePercentage,
        status: 'active',
        createdBy: userId
      });
      budgetCount++;
    }
  }

  return {
    categoriesCount: Object.keys(categoryMap).length,
    productsCount: Object.keys(productMap).length,
    totalInventoryValue: totalInventoryVal,
    accountsCount: Object.keys(accountMap).length,
    journalsCount: Object.keys(journalMap).length,
    salesOrdersCount: salesOrderCount,
    purchaseOrdersCount: purchaseOrderCount,
    journalEntriesCount: journalEntryCount,
    stockMovementsCount: stockMovementCount,
    budgetsCount: budgetCount
  };
};

if (process.argv[1].endsWith('seedCompleteEnterpriseData.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    const res = await seedCompleteEnterpriseData();
    console.log('SUCCESS: Seeded complete enterprise operational data:');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
}
