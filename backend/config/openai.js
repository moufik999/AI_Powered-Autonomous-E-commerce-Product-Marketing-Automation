/**
 * OmniMarket AI - OpenAI Configuration
 * Configures OpenAI client for commercial advertising background generation.
 */

require('dotenv').config();
const OpenAI = require('openai');
const logger = require('../utils/logger');

const apiKey = process.env.OPENAI_API_KEY;
let openaiClient = null;

if (apiKey && apiKey !== 'your_openai_api_key_here') {
  try {
    openaiClient = new OpenAI({ apiKey });
    logger.info('OpenAI Client initialized successfully for Image Generation.');
  } catch (err) {
    logger.error('Failed to initialize OpenAI client:', err.message);
  }
} else {
  logger.warn('OPENAI_API_KEY is not configured. Photocard generator will use procedural studio fallback backgrounds.');
}

const isOpenAiConfigured = () => Boolean(openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'));

module.exports = {
  openaiClient,
  isOpenAiConfigured,
  imageModel: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3'
};
