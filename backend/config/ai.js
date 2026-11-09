/**
 * OmniMarket AI - Google Gemini AI Configuration
 * Uses official @google/genai SDK
 */

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

let genAIClient = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAIClient = new GoogleGenAI({ apiKey });
    logger.info(`Gemini AI Client initialized successfully (Model: ${modelName})`);
  } catch (err) {
    logger.error('Failed to initialize Google GenAI client:', err.message);
  }
} else {
  logger.warn('GEMINI_API_KEY is not configured. AI fallback templates will be used.');
}

const isAiConfigured = () => Boolean(genAIClient && process.env.GEMINI_API_KEY);

module.exports = {
  genAIClient,
  modelName,
  isAiConfigured,
  temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
  maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1024', 10)
};
