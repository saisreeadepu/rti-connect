const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rticonnect')
.then(async () => {
  try {
    const users = [
      { name: 'Test Citizen', email: 'citizen@test.com', phone: '1234567890', role: 'citizen', password: 'password123' },
      { name: 'Test PIO', email: 'pio@test.com', phone: '1234567891', role: 'pio', department: 'Revenue Department', password: 'password123' },
      { name: 'Test Appellate', email: 'appellate@test.com', phone: '1234567892', role: 'appellate', department: 'Revenue Department', password: 'password123' },
      { name: 'Test Admin', email: 'admin@test.com', phone: '1234567893', role: 'admin', password: 'password123' }
    ];
    let pioId, appellateId;
    for (let u of users) {
      let doc = await User.findOne({ email: u.email });
      if (!doc) {
        doc = await User.create(u);
        console.log('Created: ' + u.email);
      } else {
        console.log('Exists: ' + u.email);
      }
      if (u.role === 'pio') pioId = doc._id;
      if (u.role === 'appellate') appellateId = doc._id;
    }

    // Ensure Revenue Department exists with PIO and Appellate
    let dept = await Department.findOne({ name: 'Revenue Department' });
    if (!dept) {
      await Department.create({
        name: 'Revenue Department',
        description: 'Handles revenue and land records',
        categories: ['Land', 'Taxes'],
        pios: [pioId],
        appellateAuthority: appellateId
      });
      console.log('Created Revenue Department');
    } else {
      if (!dept.pios.includes(pioId)) dept.pios.push(pioId);
      dept.appellateAuthority = appellateId;
      await dept.save();
      console.log('Updated Revenue Department');
    }
  } catch (err) {
    console.error(err);
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
