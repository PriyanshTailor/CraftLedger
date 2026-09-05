import User from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { env } from '../config/env.js';

export const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ role: { $in: [ROLES.PLATFORM_ADMIN, 'super_admin'] } });

    if (!existing) {
      if (!env.PLATFORM_ADMIN_EMAIL || !env.PLATFORM_ADMIN_INITIAL_PASSWORD) {
        console.warn('Platform Admin was not seeded: PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_INITIAL_PASSWORD are required.');
        return;
      }
      await User.create({
        name:         'Platform Admin',
        email:        env.PLATFORM_ADMIN_EMAIL,
        passwordHash: env.PLATFORM_ADMIN_INITIAL_PASSWORD,
        role:         ROLES.PLATFORM_ADMIN,
        isActive:     true,
      });
      console.log('Platform Admin seeded. Change the initial password after first login.');
    } else {
      console.log('Platform Admin already exists.');
    }
  } catch (err) {
    console.error('❌ Failed to seed Super Admin:', err.message);
  }
};
