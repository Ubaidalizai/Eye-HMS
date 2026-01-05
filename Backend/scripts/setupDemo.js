require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const connectDB = require('../config/db');

const demoUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    password: 'demo123',
    phoneNumber: '1234567890',
    role: 'admin',
  },
  {
    firstName: 'Dr. John',
    lastName: 'Smith',
    email: 'doctor@demo.com',
    password: 'demo123',
    phoneNumber: '1234567891',
    role: 'doctor',
    percentage: 30,
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'pharmacist@demo.com',
    password: 'demo123',
    phoneNumber: '1234567892',
    role: 'pharmacist',
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'receptionist@demo.com',
    password: 'demo123',
    phoneNumber: '1234567893',
    role: 'receptionist',
  },
];

const setupDemo = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('\n🚀 Setting up demo accounts...\n');

    const createdUsers = [];
    const existingUsers = [];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        existingUsers.push(userData);
        console.log(`⚠️  ${userData.role} account already exists: ${userData.email}`);
      } else {
        const user = new User(userData);
        await user.save();
        createdUsers.push(userData);
        console.log(`✅ Created ${userData.role} account: ${userData.email}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 DEMO ACCOUNTS - LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('\nAll accounts use the same password: demo123\n');

    demoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.toUpperCase()}`);
      console.log(`   Name:     ${user.firstName} ${user.lastName}`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: demo123`);
      if (user.percentage) {
        console.log(`   Percentage: ${user.percentage}%`);
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n💡 TIP: Use these accounts to demonstrate different role-based access!');
    console.log('⚠️  Remember to change passwords in production!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up demo accounts:', error.message);
    process.exit(1);
  }
};

setupDemo();

