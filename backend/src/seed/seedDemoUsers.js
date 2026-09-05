import { connectDB } from '../config/db.js';
import { seedDemoRoleUsers } from './demoRoleUsers.js';

try {
  await connectDB();
  const result = await seedDemoRoleUsers();
  console.log(`Demo users ready: ${result.accountantCount} accountants and ${result.contactCount} contacts. Password: ${result.password}`);
  process.exit(0);
} catch (error) {
  console.error(`Could not seed demo users: ${error.message}`);
  process.exit(1);
}
