import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/craftledger');
  const db = mongoose.connection.db;

  // Add realistic discretionary discounts to 3 orders to demonstrate excessive discount leaks
  await db.collection('salesorders').updateOne(
    { orderNumber: 'SO-2026-0002' },
    { $set: { discount: 15, subtotal: 362000, totalAmount: Math.round(362000 * 0.85 * 1.18) } }
  );
  await db.collection('salesorders').updateOne(
    { orderNumber: 'SO-2026-0010' },
    { $set: { discount: 12, subtotal: 332000, totalAmount: Math.round(332000 * 0.88 * 1.18) } }
  );
  await db.collection('salesorders').updateOne(
    { orderNumber: 'SO-2026-0015' },
    { $set: { discount: 18, subtotal: 385000, totalAmount: Math.round(385000 * 0.82 * 1.18) } }
  );

  // Add one low margin custom piece to products (< 15% margin) to demonstrate critical low margin product leak
  const existingLow = await db.collection('products').findOne({ sku: 'CUST-SOFA-LOW' });
  if (!existingLow) {
    const p1 = await db.collection('products').findOne({});
    await db.collection('products').insertOne({
      businessId: p1.businessId,
      name: 'Custom Fluted Teak Executive Credenza (Clearance Quote)',
      sku: 'CUST-SOFA-LOW',
      category: 'Storage',
      costPrice: 52000,
      sellingPrice: 58000, // Margin: 10.3%
      quantityOnHand: 4,
      reorderLevel: 2,
      unit: 'pcs',
      isActive: true,
      inventoryHoldingDays: 75,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log('Successfully updated realistic test samples in DB.');
  process.exit(0);
}

run().catch(console.error);
