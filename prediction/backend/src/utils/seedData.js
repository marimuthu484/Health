  require('dotenv').config();
  const mongoose = require('mongoose');
  const User = require('../models/User');
  const { USER_ROLES } = require('../config/constants');

  const seedAdmin = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      
      // Check if admin already exists
      const adminExists = await User.findOne({ 
        email: process.env.ADMIN_EMAIL 
      });
      
      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: USER_ROLES.ADMIN,
          isEmailVerified: true
        });
        
        console.log('Admin user created successfully');
      } else {
        console.log('Admin user already exists');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error seeding admin:', error);
      process.exit(1);
    }
  };

  seedAdmin();
