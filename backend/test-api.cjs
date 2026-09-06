const http = require('http');
const mongoose = require('mongoose');

const makeRequest = (options, postData) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ status: res.statusCode, data }));
  });
  req.on('error', reject);
  if (postData) req.write(JSON.stringify(postData));
  req.end();
});

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/craftledger');
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ role: { $ne: 'platform_admin' } });
  if (!user) {
    console.log('No users found');
    process.exit(1);
  }
  const customer = await db.collection('contacts').findOne({ contactType: 'customer' });
  const product = await db.collection('products').findOne();

  console.log('Found user:', user.email);

  // 1. Login
  const loginRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: user.email, password: 'Demo@123' });

  const loginData = JSON.parse(loginRes.data);
  const token = loginData.data.token;
  console.log('Got token:', token ? 'Yes' : 'No');

  if (!token) {
      console.log('Login failed:', loginData);
      process.exit(1);
  }

  // 2. Create Sales Order
  const orderRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/v1/sales/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
  }, {
    customerId: customer._id.toString(),
    items: [{ productId: product._id.toString(), quantity: 1, discount: 0 }]
  });

  console.log('Order Response:', orderRes.status, orderRes.data);
  process.exit(0);
}
run();
