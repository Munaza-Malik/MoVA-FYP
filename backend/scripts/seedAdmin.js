// scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'StrongP@ss123!'; // only default for dev

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(adminPassword, 12);

  const admin = new User({
    name: 'Administrator',
    email: adminEmail,
    password: hashed,
    role: 'admin',
    userType: 'admin'
  });

  await admin.save();
  console.log('Admin created:', adminEmail);
  mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  mongoose.disconnect();
});
