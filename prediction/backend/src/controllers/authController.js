const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { USER_ROLES } = require('../config/constants');
const emailService = require('../services/emailService');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, ...additionalData } = req.body;

    console.log('Registration attempt:', { name, email, role }); // Debug log

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || USER_ROLES.PATIENT
    });

    // Create role-specific profile
    if (role === USER_ROLES.DOCTOR) {
      const { 
        specialization, 
        qualification, 
        experience, 
        licenseNumber, 
        clinicAddress, 
        phone, 
        consultationFee 
      } = additionalData;
      
      // Validate doctor fields
      if (!specialization || !qualification || !experience || !licenseNumber || !clinicAddress || !phone || !consultationFee) {
        // If validation fails, delete the created user
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'All doctor fields are required'
        });
      }

      await Doctor.create({
        userId: user._id,
        specialization,
        qualification,
        experience: parseInt(experience),
        licenseNumber,
        clinicAddress,
        phone,
        consultationFee: parseInt(consultationFee),
        status: 'pending'
      });

      // Send notification to admin (optional - wrap in try-catch to prevent failure)
      try {
        if (process.env.ADMIN_EMAIL) {
          await emailService.sendDoctorRegistrationNotification(user);
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail registration if email fails
      }
    } else {
      // Create patient profile
      await Patient.create({
        userId: user._id,
        phone: additionalData.phone || '',
        dateOfBirth: additionalData.dateOfBirth,
        gender: additionalData.gender,
        medicalReports: []
      });
    }

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: role === USER_ROLES.DOCTOR 
        ? 'Registration successful. Please wait for admin approval.' 
        : 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    console.log('Login attempt:', { email, userType }); // Debug log

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user role matches
    if (userType && user.role !== userType) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${userType}`
      });
    }

    // Check if doctor is approved
    if (user.role === USER_ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (!doctor) {
        return res.status(500).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      
      if (doctor.status !== 'approved') {
        return res.status(401).json({
          success: false,
          message: doctor.status === 'rejected' 
            ? 'Your registration has been rejected. Please contact admin.' 
            : 'Your registration is pending approval. Please wait for admin verification.'
        });
      }
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    let userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    // Get role-specific data
    if (req.user.role === USER_ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      userData.doctorInfo = doctor;
    } else if (req.user.role === USER_ROLES.PATIENT) {
      const patient = await Patient.findOne({ userId: req.user._id });
      userData.patientInfo = patient;
    }

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user data'
    });
  }
};
