/**
 * OmniMarket AI - Cloudinary Service
 * Handles uploading, storing, and optimizing generated photocard images and backgrounds.
 * Features automatic Base64 Data URL fallback if Cloudinary credentials are not set.
 */

const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const logger = require('../utils/logger');

class CloudinaryService {
  /**
   * Upload an image buffer or base64 string to Cloudinary
   * @param {Buffer|string} imageBufferOrBase64 - Image buffer or data URL
   * @param {Object} [options]
   * @param {string} [options.folder='omnimarket_photocards'] - Destination folder
   * @param {string} [options.publicId] - Optional public ID
   * @returns {Promise<{secureUrl: string, publicId: string, format: string, isCloudinary: boolean}>}
   */
  async uploadImage(imageBufferOrBase64, { folder = 'omnimarket_photocards', publicId = null } = {}) {
    // If Cloudinary is configured, upload to Cloudinary CDN
    if (isCloudinaryConfigured()) {
      try {
        let base64ToUpload;
        if (Buffer.isBuffer(imageBufferOrBase64)) {
          base64ToUpload = `data:image/png;base64,${imageBufferOrBase64.toString('base64')}`;
        } else {
          base64ToUpload = imageBufferOrBase64;
        }

        logger.info(`Uploading photocard asset to Cloudinary (folder: ${folder})...`);
        const uploadResult = await cloudinary.uploader.upload(base64ToUpload, {
          folder,
          public_id: publicId || undefined,
          resource_type: 'image',
          quality: 'auto:best',
          fetch_format: 'auto'
        });

        logger.info(`✓ Successfully uploaded to Cloudinary: ${uploadResult.secure_url}`);
        return {
          secureUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          isCloudinary: true
        };
      } catch (err) {
        logger.warn(`Cloudinary upload failed (${err.message}). Falling back to local data URL.`);
      }
    }

    // Fallback: Local Base64 Data URL representation
    let dataUrl;
    if (Buffer.isBuffer(imageBufferOrBase64)) {
      dataUrl = `data:image/png;base64,${imageBufferOrBase64.toString('base64')}`;
    } else {
      dataUrl = imageBufferOrBase64;
    }

    return {
      secureUrl: dataUrl,
      publicId: `local_${Date.now()}`,
      format: 'png',
      isCloudinary: false
    };
  }
}

module.exports = new CloudinaryService();
