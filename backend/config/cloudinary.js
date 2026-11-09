/**
 * OmniMarket AI - Cloudinary Configuration
 * Configures Cloudinary SDK for storing and optimizing AI generated photocards and backgrounds.
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudName && cloudName !== 'your_cloudinary_cloud_name' &&
  apiKey && apiKey !== 'your_cloudinary_api_key' &&
  apiSecret && apiSecret !== 'your_cloudinary_api_secret'
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  logger.info(`Cloudinary configured successfully (Cloud Name: ${cloudName})`);
} else {
  logger.warn('Cloudinary credentials are not configured. Local data URI storage fallback will be used.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured: () => isConfigured
};
