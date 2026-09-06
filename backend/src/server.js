import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedSuperAdmin } from './seed/superAdmin.js';
import { startMlService } from './services/mlServiceManager.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Seed Super Admin if not exists
  await seedSuperAdmin();

  // Automatically start Python ML Service alongside backend
  await startMlService();

  // Start Express Server
  const server = app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
