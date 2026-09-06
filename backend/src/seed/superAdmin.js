import User from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { env } from '../config/env.js';

export const seedSuperAdmin = async () => {
  try {
    const adminEmail = (env.PLATFORM_ADMIN_EMAIL || 'admin@craftledger.com').toLowerCase().trim();
    const adminPassword = env.PLATFORM_ADMIN_INITIAL_PASSWORD;
    if (!adminPassword) {
      throw new Error('PLATFORM_ADMIN_INITIAL_PASSWORD must be configured before seeding admin users');
    }

    // Ensure standard admin@craftledger.com exists
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({
        name:         'Platform Admin',
        email:        adminEmail,
        passwordHash: adminPassword,
        role:         ROLES.PLATFORM_ADMIN,
        isActive:     true,
      });
      console.log(`✅ Platform Admin (${adminEmail}) created with default credentials.`);
    }

    // Ensure superadmin@craftledger.com also exists or is updated if present
    let superAdmin = await User.findOne({ email: 'superadmin@craftledger.com' });
    if (!superAdmin) {
      await User.create({
        name:         'Super Admin',
        email:        'superadmin@craftledger.com',
        passwordHash: adminPassword,
        role:         ROLES.PLATFORM_ADMIN,
        isActive:     true,
      });
    }
  } catch (err) {
    console.error('❌ Failed to seed Super Admin:', err.message);
  }
};
