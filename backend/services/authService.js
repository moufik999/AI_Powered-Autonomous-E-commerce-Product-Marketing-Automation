/**
 * OmniMarket AI - Authentication Service
 * Business logic for user registration, credential validation, and JWT issuing.
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_random_key_min_64_characters_long_for_security';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
  /**
   * Generate signed JWT token
   */
  signToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Register a new user
   */
  async register({ email, password }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      const error = new Error('Invalid email address format');
      error.statusCode = 400;
      throw error;
    }

    const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);

    if (!password || password.length < 8 || !hasUpperLower || !hasNumber || !hasSpecial) {
      const error = new Error('Password must be at least 8 characters with upper, lower, number, and special character');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const newUser = await User.create({ email, password });
    const token = this.signToken(newUser);

    return {
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    };
  }

  /**
   * Login user with email & password
   */
  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = this.signToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Fetch current user profile
   */
  async getMe(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User no longer exists.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
