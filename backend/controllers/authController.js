const jwt = require('jsonwebtoken');
const User = require('../models/User');

// .env না পেলেও যেন কখনো ক্র্যাশ না করে সেজন্য ডিফল্ট সিক্রেট কি ফলব্যাক দেওয়া হলো
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_random_key_min_64_characters_long_for_security';

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// 1. User Registration Handler
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }

    const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);

    if (!password || password.length < 8 || !hasUpperLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with upper, lower, number, and special character',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Save to MongoDB
    const newUser = await User.create({ email, password });
    const token = signToken(newUser);

    console.log(`✓ New User Registered: ${newUser.email}`);

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('Registration Error Details:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// 2. User Login Handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });
    }

    const token = signToken(user);
    console.log(`✓ User Logged In: ${user.email}`);

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login Error Details:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// 3. Current User Profile Handler
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};