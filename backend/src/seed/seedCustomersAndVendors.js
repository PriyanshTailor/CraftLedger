import mongoose from 'mongoose';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import { ROLES } from '../config/roles.js';

const customersData = [
  {
    name: 'Amber Luxe Interiors',
    email: 'contact@amberinteriors.demo',
    phone: '+91 98201 44521',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '402, Trade World, Senapati Bapat Marg, Lower Parel',
    taxNumber: '27AABCU9603R1ZM',
    creditLimit: 250000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Custom Fluted Teak Credenza & Buffet Table', amount: 85000, daysOffset: 12 },
      { item: 'Velvet Dining Chairs (Set of 8)', amount: 64000, daysOffset: 28 },
      { item: 'Marble Top Brass Coffee Table Set', amount: 42000, daysOffset: 45 }
    ]
  },
  {
    name: 'Studio Vistara Architects',
    email: 'projects@studiovistara.demo',
    phone: '+91 98791 22340',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: '12, Shivalik High Street, Bodakdev, SG Highway',
    taxNumber: '24AAACT1234F1ZP',
    creditLimit: 300000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Solid Sheesham 10-Seater Conference Table', amount: 145000, daysOffset: 15 },
      { item: 'Acoustic Slat Wood Wall Paneling (300 sqft)', amount: 96000, daysOffset: 34 }
    ]
  },
  {
    name: 'Aarohi Design Studio',
    email: 'procurement@aarohidesign.demo',
    phone: '+91 98250 88912',
    city: 'Surat',
    state: 'Gujarat',
    address: 'B-704, Royal Trade Centre, Adajan',
    taxNumber: '24AABCA5543D1ZN',
    creditLimit: 180000,
    paymentTerms: 'Net 15 days',
    purchases: [
      { item: 'Minimalist Scandinavian Oak Desks (x6)', amount: 72000, daysOffset: 8 },
      { item: 'Modular Ergonomic High-Back Chairs (x6)', amount: 48000, daysOffset: 22 }
    ]
  },
  {
    name: 'Kalyan Heritage Hotels & Resorts',
    email: 'purchase@kalyanheritage.demo',
    phone: '+91 94141 55670',
    city: 'Udaipur',
    state: 'Rajasthan',
    address: 'Lake Palace Road, Kalaji Goraji',
    taxNumber: '08AABCK8890M1ZW',
    creditLimit: 500000,
    paymentTerms: 'Net 45 days',
    purchases: [
      { item: 'Heritage Carved Teak King Bed Frames (x4)', amount: 220000, daysOffset: 18 },
      { item: 'Handcrafted Antique Brass-Inlay Nightstands (x8)', amount: 96000, daysOffset: 38 },
      { item: 'Royal Banquet Armchairs (x12)', amount: 132000, daysOffset: 60 }
    ]
  },
  {
    name: 'Metro Living Co-Working Spaces',
    email: 'facilities@metroliving.demo',
    phone: '+91 97654 33210',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'ICC Tech Tower, Senapati Bapat Road, Shivajinagar',
    taxNumber: '27AABCM7789K1Z4',
    creditLimit: 400000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: '4-Person Island Workstation Pods (x3)', amount: 165000, daysOffset: 10 },
      { item: 'Acoustic Focus Phone Booth Pods (x2)', amount: 110000, daysOffset: 25 },
      { item: 'Cafeteria High-Top Bar Tables & Stools', amount: 55000, daysOffset: 48 }
    ]
  },
  {
    name: 'The Courtyard Cafe & Bistro',
    email: 'admin@courtyardbistro.demo',
    phone: '+91 98450 11223',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '77, 100 Feet Road, Indiranagar',
    taxNumber: '29AABCT6677H1ZX',
    creditLimit: 150000,
    paymentTerms: 'Net 15 days',
    purchases: [
      { item: 'Outdoor Weatherproof Teak Bistro Tables (x8)', amount: 68000, daysOffset: 6 },
      { item: 'Upholstered Booth Seating Units (x4)', amount: 84000, daysOffset: 20 }
    ]
  },
  {
    name: 'Oberoi Penthouse Luxury Living',
    email: 'interiors@oberoipenthouse.demo',
    phone: '+91 98110 99887',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Tower 3, Penthouse 21B, Golf Course Road',
    taxNumber: '07AABCO4432P1ZQ',
    creditLimit: 450000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Walk-In Wardrobe System with Glass LED Shutters', amount: 280000, daysOffset: 16 },
      { item: 'Oversized Sectional Cloud Sofa in Cream Bouclé', amount: 195000, daysOffset: 42 }
    ]
  },
  {
    name: 'Zenith Tech Hub Headquarters',
    email: 'workplace@zenithtech.demo',
    phone: '+91 99890 33445',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Mindspace IT Park, Building 12, Hitec City',
    taxNumber: '36AABCZ1122N1ZU',
    creditLimit: 600000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Executive C-Suite Walnut Desk with Leather Blotter', amount: 135000, daysOffset: 14 },
      { item: 'Reception Area Curved Fluted Reception Counter', amount: 125000, daysOffset: 29 },
      { item: 'Townhall Tiered Wood Bleacher Seating Modules', amount: 175000, daysOffset: 52 }
    ]
  },
  {
    name: 'Prakriti Organic Villa Resort',
    email: 'stay@prakritigoa.demo',
    phone: '+91 98221 66778',
    city: 'North Goa',
    state: 'Goa',
    address: 'House 142, Bouta Vaddo, Assagao',
    taxNumber: '30AABCP9900L1ZV',
    creditLimit: 200000,
    paymentTerms: 'Net 21 days',
    purchases: [
      { item: 'Solid Acacia Outdoor Poolside Loungers (x6)', amount: 78000, daysOffset: 9 },
      { item: 'Rattan & Solid Wood Canopy Bed Frames (x3)', amount: 115000, daysOffset: 26 }
    ]
  },
  {
    name: 'Dr. Siddharth & Ananya Trivedi',
    email: 'siddharth.trivedi@demo.client',
    phone: '+91 98240 11990',
    city: 'Vadodara',
    state: 'Gujarat',
    address: 'Bungalow 7, Vasna Road, Alkapuri',
    creditLimit: 150000,
    paymentTerms: 'Net 15 days',
    purchases: [
      { item: 'Italian Marble Top 6-Seater Dining Table', amount: 92000, daysOffset: 11 },
      { item: 'Living Room TV Console Unit with Fluted Drawers', amount: 38000, daysOffset: 27 }
    ]
  },
  {
    name: 'Nova Dental Care & Wellness Clinic',
    email: 'admin@novaclinic.demo',
    phone: '+91 98212 44332',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'G-02, Platinum Heights, Linking Road, Bandra West',
    taxNumber: '27AABCN8876J1ZT',
    creditLimit: 120000,
    paymentTerms: 'Net 15 days',
    purchases: [
      { item: 'Ergonomic Patient Consultation Desks (x2)', amount: 46000, daysOffset: 7 },
      { item: 'Anti-Microbial Medical Leatherette Waiting Chairs (x8)', amount: 52000, daysOffset: 23 }
    ]
  },
  {
    name: 'Elysian Boutique Jewellers',
    email: 'stores@elysianjewels.demo',
    phone: '+91 94140 22331',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Shop 18, MI Road, Opp. Raj Mandir Cinema',
    taxNumber: '08AABCE3321K1ZO',
    creditLimit: 280000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Jewelry Showcase Vitrines with Tempered Glass (x4)', amount: 140000, daysOffset: 17 },
      { item: 'Velvet Swivel Consultation Stools (x6)', amount: 48000, daysOffset: 36 }
    ]
  },
  {
    name: 'Greenfield International School',
    email: 'logistics@greenfield.demo',
    phone: '+91 98790 66554',
    city: 'Gandhinagar',
    state: 'Gujarat',
    address: 'Sector 24, Institutional Area, Knowledge Park',
    taxNumber: '24AABCG5566M1ZY',
    creditLimit: 350000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Library Modular Hexagon Study Pods (x6)', amount: 112000, daysOffset: 13 },
      { item: 'Faculty Conference Table & Mesh Chairs', amount: 88000, daysOffset: 32 }
    ]
  },
  {
    name: 'Avani Luxury Living Showroom',
    email: 'sales@avaniliving.demo',
    phone: '+91 98401 55443',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '15, Khader Nawaz Khan Road, Nungambakkam',
    taxNumber: '33AABCA8899R1ZS',
    creditLimit: 400000,
    paymentTerms: 'Net 30 days',
    purchases: [
      { item: 'Showroom Display L-Shaped Leatherette Sofa', amount: 125000, daysOffset: 19 },
      { item: 'Solid Walnut Credenza & Media Console Unit', amount: 78000, daysOffset: 44 }
    ]
  },
  {
    name: 'Urban Craft Collective',
    email: 'buyer@urbancraft.demo',
    phone: '+91 97660 77889',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Unit 5, Creaticity Mall, Yerawada',
    taxNumber: '27AABCU1100F1ZE',
    creditLimit: 220000,
    paymentTerms: 'Net 21 days',
    purchases: [
      { item: 'Solid Sheesham Floating Nightstands (x10)', amount: 65000, daysOffset: 15 },
      { item: 'Hand-Carved Wall Mirror Consoles (x4)', amount: 58000, daysOffset: 39 }
    ]
  }
];

const vendorsData = [
  {
    name: 'Rajasthan Teak & Timber Mills',
    email: 'sales@rajasthanteak.demo',
    phone: '+91 94140 88776',
    city: 'Jodhpur',
    state: 'Rajasthan',
    address: 'Plot 44, Heavy Industrial Area, Basni 2nd Phase',
    taxNumber: '08AABCR1122D1ZM',
    paymentTerms: 'Net 30 days',
    bills: [
      { item: 'Kiln-Dried CP Teak Planks Grade A (80 cu.ft)', amount: 98000, daysOffset: 8 },
      { item: 'Seasoned Sheesham Logs Selected Timber', amount: 65000, daysOffset: 24 }
    ]
  },
  {
    name: 'Imperial Foam & Cushioning Corp',
    email: 'orders@imperialfoam.demo',
    phone: '+91 98202 33441',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Gala 15, Reliable Industrial Estate, Kanjurmarg West',
    taxNumber: '27AABCI4455N1ZQ',
    paymentTerms: 'Net 15 days',
    bills: [
      { item: 'High-Density 40D Foam Sheets (50 pcs)', amount: 48000, daysOffset: 5 },
      { item: 'Memory Foam Topper Layers & Dacron Quilting Roll', amount: 32000, daysOffset: 18 }
    ]
  },
  {
    name: 'Noble Brass & Metal Hardware',
    email: 'hardware@noblemetal.demo',
    phone: '+91 98370 11992',
    city: 'Aligarh',
    state: 'Uttar Pradesh',
    address: '88, Industrial Estate, ITI Road',
    taxNumber: '09AABCN9988P1ZR',
    paymentTerms: 'Net 21 days',
    bills: [
      { item: 'Solid Brass Antique Brushed Handles (200 pcs)', amount: 36000, daysOffset: 9 },
      { item: 'Heavy-Duty Telescopic Soft-Close Drawer Runners', amount: 28000, daysOffset: 27 }
    ]
  },
  {
    name: 'Veneer Craft & Ply Industries',
    email: 'supply@veneercraft.demo',
    phone: '+91 98251 77665',
    city: 'Gandhinagar',
    state: 'Gujarat',
    address: 'Plot 312, GIDC Industrial Estate, Sector 28',
    taxNumber: '24AABCV3322L1ZK',
    paymentTerms: 'Net 30 days',
    bills: [
      { item: 'Calibrated IS:710 Marine Ply 18mm (60 sheets)', amount: 78000, daysOffset: 11 },
      { item: 'Natural American Walnut Veneer Sheets (40 sheets)', amount: 56000, daysOffset: 31 }
    ]
  },
  {
    name: 'Velvet Luxe Textile Mills',
    email: 'fabrics@velvetluxe.demo',
    phone: '+91 98253 44556',
    city: 'Surat',
    state: 'Gujarat',
    address: '4th Floor, Millennium Textile Market, Ring Road',
    taxNumber: '24AABCV7766T1ZJ',
    paymentTerms: 'Net 15 days',
    bills: [
      { item: 'Water-Repellent Royal Blue Velvet (120 meters)', amount: 54000, daysOffset: 6 },
      { item: 'Heavyweight Neutral Cream Bouclé Fabric (80 meters)', amount: 46000, daysOffset: 21 }
    ]
  },
  {
    name: 'Zenith Precision Glass & Mirrors',
    email: 'glass@zenithprecision.demo',
    phone: '+91 98792 11002',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Shade 14, Changodar Industrial Zone, Sarkhej Bavla Road',
    taxNumber: '24AABCZ9988G1ZB',
    paymentTerms: 'Net 15 days',
    bills: [
      { item: '12mm Toughened Clear Glass Table Tops (10 pcs)', amount: 38000, daysOffset: 7 },
      { item: '6mm Tinted Bronze Mirrors with Beveled Edges', amount: 26000, daysOffset: 25 }
    ]
  },
  {
    name: 'AeroCoat Industrial Finishes',
    email: 'order@aerocoat.demo',
    phone: '+91 97650 99887',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'W-42, MIDC Bhosari, Industrial Area',
    taxNumber: '27AABCA2211C1ZX',
    paymentTerms: 'Net 21 days',
    bills: [
      { item: 'Italian PU Matte Clear Coat & Hardener (60 Liters)', amount: 42000, daysOffset: 13 },
      { item: 'Oil-Based Wood Stains & Grain Fillers Assortment', amount: 18000, daysOffset: 29 }
    ]
  },
  {
    name: 'Apex Powder Coating & Steel Fab',
    email: 'contact@apexsteel.demo',
    phone: '+91 98241 88770',
    city: 'Vadodara',
    state: 'Gujarat',
    address: 'B-12, Makarpura GIDC Industrial Estate',
    taxNumber: '24AABCA6655S1ZC',
    paymentTerms: 'Net 30 days',
    bills: [
      { item: 'Laser-Cut Steel Table Leg Frames (15 sets)', amount: 52000, daysOffset: 16 },
      { item: 'Powder-Coated Matte Black Metal Chair Bases (30 pcs)', amount: 34000, daysOffset: 35 }
    ]
  },
  {
    name: 'Supreme Packaging & Corrugated Boxes',
    email: 'dispatch@supremepackaging.demo',
    phone: '+91 98205 11229',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Plot 7, Taloja MIDC, Navi Mumbai',
    taxNumber: '27AABCS5544P1ZD',
    paymentTerms: 'Net 15 days',
    bills: [
      { item: 'Custom Printed 7-Ply Heavy Duty Furniture Boxes (200 pcs)', amount: 31000, daysOffset: 10 },
      { item: 'High-Density EPE Foam Corner Protectors & Air Bubble Rolls', amount: 16000, daysOffset: 22 }
    ]
  },
  {
    name: 'Kisan Sawmills & Timber Depot',
    email: 'accounts@kisansawmill.demo',
    phone: '+91 98255 66778',
    city: 'Valsad',
    state: 'Gujarat',
    address: 'Station Road, Gungwada Industrial Area',
    taxNumber: '24AABCK1199M1ZF',
    paymentTerms: 'Net 30 days',
    bills: [
      { item: 'Kiln-Dried Mango Wood Furniture Blanks (120 pcs)', amount: 44000, daysOffset: 14 },
      { item: 'Structural Hardwood Framing Battens (200 rft)', amount: 22000, daysOffset: 33 }
    ]
  },
  {
    name: 'Everlast Screws & Assembly Hardware',
    email: 'sales@everlastfasteners.demo',
    phone: '+91 98250 33221',
    city: 'Rajkot',
    state: 'Gujarat',
    address: '8, Aji Industrial Area, 80 Feet Road',
    taxNumber: '24AABCE4433F1ZG',
    paymentTerms: 'Net 21 days',
    bills: [
      { item: 'SS 304 Hex Drive Furniture Confirmat Screws (10,000 pcs)', amount: 19000, daysOffset: 12 },
      { item: 'Zinc Plated Cam Locks & Connecting Dowels (2,500 sets)', amount: 15000, daysOffset: 28 }
    ]
  },
  {
    name: 'Natura Organic Cotton & Linen Supply',
    email: 'textiles@naturalinen.demo',
    phone: '+91 98422 11990',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '14, Avinashi Road, Peelamedu',
    taxNumber: '33AABCN6677T1ZH',
    paymentTerms: 'Net 30 days',
    bills: [
      { item: '100% Pure Woven Belgian-Style Linen (90 meters)', amount: 48000, daysOffset: 17 },
      { item: 'Heavy Cotton Canvas Dust & Bottom Webbing (150 meters)', amount: 24000, daysOffset: 37 }
    ]
  },
  {
    name: 'CNC Woodcraft 3D Carving Studio',
    email: 'studio@cncwoodcraft.demo',
    phone: '+91 98258 77889',
    city: 'Surat',
    state: 'Gujarat',
    address: 'Plot 108, Sachin GIDC, Road No. 4',
    taxNumber: '24AABCC8899J1ZI',
    paymentTerms: 'Net 15 days',
    bills: [
      { item: 'CNC Precision Fluting Jobwork on Teak Shutter Panels', amount: 35000, daysOffset: 8 },
      { item: 'Custom 3D Relief Carved Headboard Panels (x3)', amount: 29000, daysOffset: 26 }
    ]
  },
  {
    name: 'Titanium Carbide Saw & Tooling Supply',
    email: 'tools@titaniumcarbide.demo',
    phone: '+91 98451 99882',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '42, Peenya Industrial Area, Phase 2',
    taxNumber: '29AABCT1100K1ZL',
    paymentTerms: 'Net 30 days',
    bills: [
      { item: 'TCT Triple Chip Saw Blades for Melamine & Solid Wood (x4)', amount: 26000, daysOffset: 15 },
      { item: 'Solid Carbide Spiral Upcut CNC Router Bits (Set of 8)', amount: 19000, daysOffset: 40 }
    ]
  },
  {
    name: 'EcoEdge PVC & Wood Edgebanding',
    email: 'info@ecoedgebanding.demo',
    phone: '+91 98100 44332',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'B-29, Okhla Industrial Area Phase 1',
    taxNumber: '07AABCE5544B1ZM',
    paymentTerms: 'Net 21 days',
    bills: [
      { item: '2mm Matching Natural Teak PVC Edgebanding Rolls (10 rolls)', amount: 18000, daysOffset: 11 },
      { item: 'High-Temperature PUR Hotmelt Edgebanding Adhesive Granules', amount: 14000, daysOffset: 30 }
    ]
  }
];

export const seedCustomersAndVendors = async () => {
  const owner = await User.findOne({ email: 'vidhitrivedi3110@gmail.com' });
  if (!owner?.businessId) {
    throw new Error('Business Owner with a valid business not found.');
  }
  const businessId = owner.businessId;
  const userId = owner._id;

  console.log(`Seeding customers and vendors for Business: ${businessId}...`);

  let customerCount = 0;
  let invoiceCount = 0;
  let totalInflow = 0;

  // Seed Customers & Invoices
  for (const c of customersData) {
    let contact = await Contact.findOne({ businessId, email: c.email });
    if (!contact) {
      contact = await Contact.create({
        businessId,
        contactType: 'customer',
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        state: c.state,
        address: c.address,
        taxNumber: c.taxNumber,
        creditLimit: c.creditLimit,
        paymentTerms: c.paymentTerms,
        isActive: true
      });
      customerCount++;
    }

    // Create invoices for this customer
    for (const [idx, p] of c.purchases.entries()) {
      const invNumber = `INV-${contact.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const existingInv = await CustomerInvoice.findOne({ businessId, invoiceNumber: invNumber });
      if (!existingInv) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + p.daysOffset);

        const subtotal = p.amount;
        const taxAmount = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + taxAmount;

        await CustomerInvoice.create({
          businessId,
          invoiceNumber: invNumber,
          customerId: contact._id,
          invoiceDate: new Date(),
          dueDate,
          subtotal,
          taxAmount,
          totalAmount,
          paidAmount: 0,
          balanceDue: totalAmount,
          status: 'issued',
          createdBy: userId
        });
        invoiceCount++;
        totalInflow += totalAmount;
      }
    }
  }

  let vendorCount = 0;
  let billCount = 0;
  let totalOutflow = 0;

  // Seed Vendors & Bills
  for (const v of vendorsData) {
    let contact = await Contact.findOne({ businessId, email: v.email });
    if (!contact) {
      contact = await Contact.create({
        businessId,
        contactType: 'vendor',
        name: v.name,
        email: v.email,
        phone: v.phone,
        city: v.city,
        state: v.state,
        address: v.address,
        taxNumber: v.taxNumber,
        paymentTerms: v.paymentTerms,
        isActive: true
      });
      vendorCount++;
    }

    // Create bills for this vendor
    for (const [idx, b] of v.bills.entries()) {
      const billNumber = `BILL-${contact.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const existingBill = await VendorBill.findOne({ businessId, billNumber });
      if (!existingBill) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + b.daysOffset);

        const subtotal = b.amount;
        const taxAmount = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + taxAmount;

        await VendorBill.create({
          businessId,
          billNumber,
          vendorId: contact._id,
          billDate: new Date(),
          dueDate,
          subtotal,
          taxAmount,
          totalAmount,
          paidAmount: 0,
          balanceDue: totalAmount,
          status: 'issued',
          createdBy: userId
        });
        billCount++;
        totalOutflow += totalAmount;
      }
    }
  }

  return {
    customerCount,
    vendorCount,
    invoiceCount,
    billCount,
    totalCustomerInflowAdded: totalInflow,
    totalVendorOutflowAdded: totalOutflow
  };
};

if (process.argv[1].endsWith('seedCustomersAndVendors.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    const result = await seedCustomersAndVendors();
    console.log('SUCCESS: Seeded customer and vendor database records:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
}
