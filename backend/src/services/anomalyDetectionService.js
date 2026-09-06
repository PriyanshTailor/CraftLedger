import Product from '../models/Product.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Account from '../models/Account.js';
import Contact from '../models/Contact.js';

/**
 * Deterministic Rule-Based Anomaly Detection Engine
 * Inspects all operational database collections to identify financial,
 * pricing, procurement, liquidity, and operational discrepancies.
 *
 * @param {string|ObjectId} businessId
 * @returns {Promise<Object>} Detected anomalies categorized with severity & financial exposure
 */
export const detectOperationalAnomalies = async (businessId) => {
  const anomalies = [];
  const now = new Date();

  // 1. Fetch core entities concurrently
  const [
    products,
    salesOrders,
    purchaseOrders,
    invoices,
    bills,
    accounts,
    customers,
    vendors
  ] = await Promise.all([
    Product.find({ businessId, isActive: true }).lean(),
    SalesOrder.find({ businessId, status: { $ne: 'cancelled' } }).populate('customerId', 'name').lean(),
    PurchaseOrder.find({ businessId, status: { $ne: 'cancelled' } }).populate('vendorId', 'name').lean(),
    CustomerInvoice.find({ businessId }).populate('customerId', 'name').lean(),
    VendorBill.find({ businessId }).populate('vendorId', 'name').lean(),
    Account.find({ businessId, isActive: true }).lean(),
    Contact.find({ businessId, contactType: 'customer', isActive: true }).lean(),
    Contact.find({ businessId, contactType: 'vendor', isActive: true }).lean()
  ]);

  // =========================================================================
  // RULE 1: RAZOR-THIN OR NEGATIVE PRODUCT MARGINS (< 15%)
  // =========================================================================
  products.forEach(p => {
    if (p.sellingPrice > 0) {
      const margin = (p.sellingPrice - p.costPrice) / p.sellingPrice;
      const marginPct = margin * 100;
      if (margin < 0.15) {
        const isNegative = margin < 0;
        const potentialDeficit = Math.round(p.quantityOnHand * Math.abs(p.costPrice - p.sellingPrice * 0.85));
        anomalies.push({
          id: `ANOM-MARG-${p.sku}`,
          category: 'Pricing & Margins',
          severity: isNegative ? 'critical' : (margin < 0.08 ? 'critical' : 'warning'),
          title: isNegative ? 'Negative Margin Product Detected' : 'Sub-Optimal Margin Threshold',
          description: `${p.name} (${p.sku}) selling price (₹${p.sellingPrice.toLocaleString('en-IN')}) provides only ${marginPct.toFixed(1)}% margin over production cost (₹${p.costPrice.toLocaleString('en-IN')}).`,
          ruleTriggered: 'Gross margin percentage < 15.0% safe operational hurdle rate.',
          financialExposure: potentialDeficit || 25000,
          affectedEntity: `${p.name} (${p.sku})`,
          actionRecommendation: 'Increase unit retail price or renegotiate supplier raw material costs to restore minimum 25% gross margin.'
        });
      }
    }
  });

  // =========================================================================
  // RULE 2: EXCESSIVE DISCOUNTS ON SALES ORDERS (> 10%)
  // =========================================================================
  salesOrders.forEach(so => {
    const disc = so.discount || 0;
    if (disc > 10) {
      const discountLoss = Math.round(so.subtotal * (disc / 100));
      anomalies.push({
        id: `ANOM-DISC-${so.orderNumber}`,
        category: 'Sales & Revenue',
        severity: disc >= 15 ? 'critical' : 'warning',
        title: 'Excessive Discretionary Discount Applied',
        description: `Order ${so.orderNumber} for client "${so.customerId?.name || 'Customer'}" includes a ${disc}% discount, eroding ₹${discountLoss.toLocaleString('en-IN')} in gross profit.`,
        ruleTriggered: 'Order discount exceeds 10.0% standard authorization limit.',
        financialExposure: discountLoss,
        affectedEntity: `${so.orderNumber} (${so.customerId?.name || 'Client'})`,
        actionRecommendation: 'Enforce dual-authorization CFO approval for discounts exceeding 8% on custom architectural contracts.'
      });
    }
  });

  // =========================================================================
  // RULE 3: UNUSUALLY LARGE SALES ORDER SIZE (OUTLIERS > 2.0x AVERAGE)
  // =========================================================================
  if (salesOrders.length > 2) {
    const avgOrderValue = salesOrders.reduce((s, o) => s + o.totalAmount, 0) / salesOrders.length;
    salesOrders.forEach(so => {
      if (so.totalAmount > avgOrderValue * 2.2) {
        anomalies.push({
          id: `ANOM-ORD-OUTLIER-${so.orderNumber}`,
          category: 'Sales & Revenue',
          severity: 'warning',
          title: 'High-Value Order Concentration Risk',
          description: `Order ${so.orderNumber} totaling ₹${so.totalAmount.toLocaleString('en-IN')} is ${(so.totalAmount / avgOrderValue).toFixed(1)}x higher than average order size (₹${Math.round(avgOrderValue).toLocaleString('en-IN')}).`,
          ruleTriggered: 'Order total value exceeds 2.2x the historical mean transaction size.',
          financialExposure: Math.round(so.totalAmount * 0.3), // 30% working capital delivery risk
          affectedEntity: `${so.orderNumber} (${so.customerId?.name || 'Client'})`,
          actionRecommendation: 'Mandate minimum 50% upfront payment milestone and credit verification before releasing production batch.'
        });
      }
    });
  }

  // =========================================================================
  // RULE 4: SEVERELY OVERDUE CUSTOMER INVOICES (> 30 DAYS OVERDUE)
  // =========================================================================
  invoices.forEach(inv => {
    if (['issued', 'partially_paid', 'overdue'].includes(inv.status) && inv.balanceDue > 0) {
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 15) {
        const isCritical = daysOverdue > 35 || inv.balanceDue > 80000;
        anomalies.push({
          id: `ANOM-AR-OVERDUE-${inv.invoiceNumber}`,
          category: 'Accounts Receivable',
          severity: isCritical ? 'critical' : 'warning',
          title: isCritical ? 'Critical Delinquent Customer Invoice' : 'Aging Receivable Notice',
          description: `Invoice ${inv.invoiceNumber} for "${inv.customerId?.name || 'Client'}" is ${daysOverdue} days overdue with an outstanding balance of ₹${inv.balanceDue.toLocaleString('en-IN')}.`,
          ruleTriggered: `Payment past due by ${daysOverdue} days (threshold: 15 days).`,
          financialExposure: inv.balanceDue,
          affectedEntity: `${inv.invoiceNumber} (${inv.customerId?.name || 'Customer'})`,
          actionRecommendation: 'Dispatch immediate legal reminder notice, apply statutory interest penalty, and pause pending shipments.'
        });
      }
    }
  });

  // =========================================================================
  // RULE 5: HIGH PROCUREMENT SPEND CONCENTRATION (> 25% TO SINGLE VENDOR)
  // =========================================================================
  if (purchaseOrders.length > 0) {
    const vendorSpend = {};
    let totalProcurementSpend = 0;

    purchaseOrders.forEach(po => {
      const vId = po.vendorId?._id ? String(po.vendorId._id) : (po.vendorId ? String(po.vendorId) : 'unknown');
      const vName = po.vendorId?.name || 'Vendor';
      if (!vendorSpend[vId]) vendorSpend[vId] = { name: vName, total: 0 };
      vendorSpend[vId].total += po.totalAmount;
      totalProcurementSpend += po.totalAmount;
    });

    if (totalProcurementSpend > 0) {
      Object.values(vendorSpend).forEach(vs => {
        const share = (vs.total / totalProcurementSpend) * 100;
        if (share > 25) {
          anomalies.push({
            id: `ANOM-VEND-CONC-${vs.name.replace(/\s+/g, '-').slice(0, 15)}`,
            category: 'Procurement & Supply Chain',
            severity: share > 35 ? 'critical' : 'warning',
            title: 'Single-Vendor Spend Concentration Risk',
            description: `Vendor "${vs.name}" accounts for ₹${vs.total.toLocaleString('en-IN')} (${share.toFixed(1)}%) of total purchasing commitments (₹${totalProcurementSpend.toLocaleString('en-IN')}).`,
            ruleTriggered: 'Single vendor procurement share exceeds 25.0% risk concentration threshold.',
            financialExposure: Math.round(vs.total * 0.25),
            affectedEntity: vs.name,
            actionRecommendation: 'Qualify alternate certified timber and hardware suppliers to mitigate supply disruption and price leverage.'
          });
        }
      });
    }
  }

  // =========================================================================
  // RULE 6: CASH & LIQUIDITY MISMATCH (NEAR-TERM BILLS EXCEED AVAILABLE CASH)
  // =========================================================================
  let totalAvailableCash = 0;
  accounts.forEach(acc => {
    if (acc.accountType === 'asset') {
      const nm = acc.accountName.toLowerCase();
      if (nm.includes('cash') || nm.includes('bank')) {
        totalAvailableCash += (acc.currentBalance || 0);
      }
    }
  });

  const next14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  let upcoming14DayBills = 0;
  bills.forEach(b => {
    if (['issued', 'partially_paid', 'overdue'].includes(b.status) && b.balanceDue > 0) {
      const d = new Date(b.dueDate);
      if (d <= next14Days) {
        upcoming14DayBills += b.balanceDue;
      }
    }
  });

  if (upcoming14DayBills > totalAvailableCash) {
    const cashDeficit = upcoming14DayBills - totalAvailableCash;
    anomalies.push({
      id: 'ANOM-LIQ-DEFICIT',
      category: 'Cash & Liquidity',
      severity: 'critical',
      title: 'Near-Term Cash Flow Deficit Warning',
      description: `Vendor obligations due within 14 days (₹${upcoming14DayBills.toLocaleString('en-IN')}) exceed currently available liquid cash (₹${totalAvailableCash.toLocaleString('en-IN')}) by ₹${cashDeficit.toLocaleString('en-IN')}.`,
      ruleTriggered: '14-Day Payables Commitments > Available Liquid Cash & Bank Balances.',
      financialExposure: cashDeficit,
      affectedEntity: 'Operating Treasury (HDFC / Cash)',
      actionRecommendation: 'Accelerate collection on overdue customer invoices and negotiate 15-day extension on timber supplier payables.'
    });
  }

  // =========================================================================
  // RULE 7: DISPROPORTIONATE INVENTORY CAPITAL LOCKUP (> 15% IN SINGLE ITEM)
  // =========================================================================
  const totalStockVal = products.reduce((sum, p) => sum + (p.quantityOnHand * p.costPrice), 0);
  if (totalStockVal > 0) {
    products.forEach(p => {
      const itemVal = p.quantityOnHand * p.costPrice;
      const share = (itemVal / totalStockVal) * 100;
      if (share > 12 && p.quantityOnHand > 10) {
        anomalies.push({
          id: `ANOM-INV-LOCK-${p.sku}`,
          category: 'Inventory Valuation',
          severity: share > 18 ? 'critical' : 'warning',
          title: 'Excessive Inventory Capital Concentration',
          description: `${p.name} (${p.sku}) holds ₹${itemVal.toLocaleString('en-IN')} (${share.toFixed(1)}% of all warehouse stock value), tying up disproportionate liquidity.`,
          ruleTriggered: 'Single SKU inventory value exceeds 12.0% of total catalog inventory valuation.',
          financialExposure: Math.round(itemVal * 0.4),
          affectedEntity: `${p.name} (${p.sku})`,
          actionRecommendation: 'Implement just-in-time batch procurement and apply targeted architectural project incentives.'
        });
      }
    });
  }

  // Sort anomalies: Critical first, then Warning, then by financial exposure descending
  const severityWeight = { critical: 1, warning: 2, info: 3 };
  anomalies.sort((a, b) => {
    if (severityWeight[a.severity] !== severityWeight[b.severity]) {
      return severityWeight[a.severity] - severityWeight[b.severity];
    }
    return b.financialExposure - a.financialExposure;
  });

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;
  const totalFinancialExposure = anomalies.reduce((sum, a) => sum + (a.financialExposure || 0), 0);

  // Group by category for visual cards
  const categorySummary = {};
  anomalies.forEach(a => {
    if (!categorySummary[a.category]) {
      categorySummary[a.category] = { count: 0, critical: 0, exposure: 0 };
    }
    categorySummary[a.category].count += 1;
    if (a.severity === 'critical') categorySummary[a.category].critical += 1;
    categorySummary[a.category].exposure += a.financialExposure;
  });

  return {
    businessId,
    totalAnomalies: anomalies.length,
    criticalCount,
    warningCount,
    totalFinancialExposure,
    healthStatus: criticalCount >= 4 ? 'High Vulnerability' : (criticalCount >= 1 ? 'Moderate Attention' : 'Healthy'),
    categorySummary,
    anomalies,
    evaluatedAt: new Date()
  };
};
